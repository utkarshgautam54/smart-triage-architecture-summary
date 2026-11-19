'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { parseReferral } from '@/lib/ai-intake'
import { getReferral, getSettings, nextAutoCount, saveReferral, setSettings } from '@/lib/store'
import { TRIAGE_CATEGORIES, type Referral } from '@/lib/types'

function refresh(id?: string) {
  revalidatePath('/', 'layout')
  if (id) revalidatePath(`/referrals/${id}`)
}

function requireReferral(id: string) {
  const referral = getReferral(id)
  if (!referral) throw new Error('Referral not found')
  return referral
}

function requirePhysician(name: unknown) {
  const physician = z.string().min(1).parse(name)
  if (!getSettings().physicians.includes(physician)) throw new Error('Unknown physician')
  return physician
}

export async function startReview(id: string, physicianName: string) {
  const physician = requirePhysician(physicianName)
  const r = requireReferral(id)
  if (r.status !== 'new') return
  saveReferral({
    ...r,
    status: 'in_review',
    assignedTo: physician,
    audit: [...r.audit, { at: new Date().toISOString(), actor: physician, action: 'Started review' }],
  })
  refresh(id)
}

export async function acceptTriage(id: string, physicianName: string) {
  const physician = requirePhysician(physicianName)
  const r = requireReferral(id)
  const now = new Date().toISOString()
  saveReferral({
    ...r,
    status: r.suggested.category === 'Decline' ? 'declined' : 'triaged',
    assignedTo: physician,
    needsAudit: false,
    final: { ...r.suggested, decision: 'accepted', decidedBy: physician, decidedAt: now },
    audit: [...r.audit, { at: now, actor: physician, action: r.final?.decision === 'auto' ? 'Approved AI auto-triage (audit)' : 'Accepted AI triage' }],
  })
  refresh(id)
}

const modifySchema = z.object({
  id: z.string(),
  physician: z.string(),
  category: z.enum(TRIAGE_CATEGORIES),
  action: z.string().trim().min(3).max(200),
  urgency: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
})

export async function modifyTriage(formData: FormData) {
  const data = modifySchema.parse(Object.fromEntries(formData))
  const physician = requirePhysician(data.physician)
  const r = requireReferral(data.id)
  const now = new Date().toISOString()
  saveReferral({
    ...r,
    status: data.category === 'Decline' ? 'declined' : 'triaged',
    assignedTo: physician,
    needsAudit: false,
    final: {
      category: data.category,
      action: data.action,
      urgency: data.urgency,
      comment: data.comment || undefined,
      decision: 'modified',
      decidedBy: physician,
      decidedAt: now,
    },
    audit: [
      ...r.audit,
      {
        at: now,
        actor: physician,
        action: 'Modified triage',
        detail: `${r.suggested.category} → ${data.category}, urgency ${r.suggested.urgency} → ${data.urgency}`,
      },
    ],
  })
  refresh(data.id)
}

const declineSchema = z.object({
  id: z.string(),
  physician: z.string(),
  comment: z.string().trim().min(3).max(500),
})

export async function declineTriage(formData: FormData) {
  const data = declineSchema.parse(Object.fromEntries(formData))
  const physician = requirePhysician(data.physician)
  const r = requireReferral(data.id)
  const now = new Date().toISOString()
  saveReferral({
    ...r,
    status: 'declined',
    assignedTo: physician,
    needsAudit: false,
    final: {
      category: 'Decline',
      action: 'Return referral to sender',
      urgency: r.suggested.urgency,
      comment: data.comment,
      decision: 'declined',
      decidedBy: physician,
      decidedAt: now,
    },
    audit: [...r.audit, { at: now, actor: physician, action: 'Declined referral', detail: data.comment }],
  })
  refresh(data.id)
}

export async function markBooked(id: string) {
  const r = requireReferral(id)
  if (r.status !== 'triaged') return
  saveReferral({
    ...r,
    status: 'booked',
    audit: [...r.audit, { at: new Date().toISOString(), actor: 'Admin', action: 'Marked as booked' }],
  })
  refresh(id)
}

export async function logCopied(id: string) {
  const r = requireReferral(id)
  saveReferral({
    ...r,
    audit: [...r.audit, { at: new Date().toISOString(), actor: 'Admin', action: 'Copied disposition for EMR' }],
  })
  refresh(id)
}

const settingsSchema = z.object({
  clinicName: z.string().trim().min(2).max(100),
  mode: z.enum(['manual', 'autonomous']),
  auditRate: z.coerce.number().int().min(1).max(100),
  autoThreshold: z.coerce.number().int().min(1).max(5),
  aiOnlyCategories: z.array(z.enum(TRIAGE_CATEGORIES)),
})

export async function updateSettings(_prev: unknown, formData: FormData) {
  const parsed = settingsSchema.safeParse({
    clinicName: formData.get('clinicName'),
    mode: formData.get('mode'),
    auditRate: formData.get('auditRate'),
    autoThreshold: formData.get('autoThreshold'),
    aiOnlyCategories: formData.getAll('aiOnlyCategories'),
  })
  if (!parsed.success) return { ok: false, message: 'Please check the highlighted values.' }
  setSettings({ ...getSettings(), ...parsed.data })
  refresh()
  return { ok: true, message: 'Settings saved.' }
}

const MAX_PDF_BYTES = 10 * 1024 * 1024

export async function ingestReferral(_prev: unknown, formData: FormData) {
  const file = formData.get('file')
  const text = String(formData.get('text') ?? '').trim()

  let input: Parameters<typeof parseReferral>[0]
  let pageCount = 1
  if (file instanceof File && file.size > 0) {
    if (file.type !== 'application/pdf') return { error: 'Only PDF files are supported.' }
    if (file.size > MAX_PDF_BYTES) return { error: 'PDF must be under 10 MB.' }
    const data = new Uint8Array(await file.arrayBuffer())
    pageCount = Math.max(1, (new TextDecoder('latin1').decode(data).match(/\/Type\s*\/Page[^s]/g) ?? []).length)
    input = { kind: 'pdf', data, filename: file.name }
  } else if (text.length >= 40) {
    input = { kind: 'text', text: text.slice(0, 20_000) }
  } else {
    return { error: 'Upload a referral PDF or paste at least a few lines of referral text.' }
  }

  let parsed
  try {
    parsed = await parseReferral(input)
  } catch (error) {
    console.error('Referral parsing failed', error)
    return { error: 'Smart Triage could not read this referral. Please try again.' }
  }

  const now = new Date().toISOString()
  const settings = getSettings()
  const id = `ref-${Date.now().toString(36)}`
  const referral: Referral = {
    id,
    receivedAt: now,
    source: 'Manual upload',
    pageCount,
    ...parsed,
    status: 'new',
    audit: [{ at: now, actor: 'Smart Triage AI', action: 'Summarized referral', detail: `Parsed ${pageCount}-page ${input.kind === 'pdf' ? 'PDF' : 'text'} referral` }],
  }

  const autoEligible =
    settings.mode === 'autonomous' &&
    (parsed.suggested.urgency <= settings.autoThreshold ||
      settings.aiOnlyCategories.includes(parsed.suggested.category))

  if (autoEligible) {
    const needsAudit = nextAutoCount() % settings.auditRate === 0
    referral.status = parsed.suggested.category === 'Decline' ? 'declined' : 'triaged'
    referral.needsAudit = needsAudit
    referral.final = { ...parsed.suggested, decision: 'auto', decidedBy: 'Smart Triage AI', decidedAt: now }
    referral.audit.push({
      at: now,
      actor: 'Smart Triage AI',
      action: 'Auto-triaged',
      detail: needsAudit ? 'Selected for physician audit queue' : 'AI-autonomous mode',
    })
  }

  saveReferral(referral)
  refresh()
  redirect(`/referrals/${id}`)
}
