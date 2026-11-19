import type { Referral, ReferralStatus } from './types'

const TIME_ZONE = 'America/Vancouver'

export const STATUS_LABELS: Record<ReferralStatus, string> = {
  new: 'New',
  in_review: 'In review',
  triaged: 'Ready to book',
  declined: 'Declined',
  booked: 'Booked',
}

export const URGENCY_LABELS = ['', 'Very low', 'Low', 'Moderate', 'High', 'Critical']

export function formatDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-CA', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: TIME_ZONE,
  })
}

export function timeAgo(iso: string) {
  const minutes = Math.round((Date.now() - +new Date(iso)) / 60_000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

export function buildDisposition(r: Referral) {
  const outcome = r.final
  const category = outcome?.category ?? r.suggested.category
  const action = outcome?.action ?? r.suggested.action
  const urgency = outcome?.urgency ?? r.suggested.urgency
  const lines = [
    'Referral Triage Summary:',
    '',
    `Patient: ${r.patient.name} (DOB: ${formatDate(r.patient.dob)})`,
    `PHN: ${r.patient.phn}`,
    `Referral from ${r.referringProvider.name} (${r.referringProvider.clinic})`,
    `Reason: ${r.reason}`,
    `Triage Decision: ${category} — ${action}`,
    `Urgency: ${URGENCY_LABELS[urgency]} (${urgency}/5)`,
    `Missing Info: ${r.missingInfo.length ? r.missingInfo.join('; ') : 'None'}`,
  ]
  if (outcome?.comment) lines.push(`Physician Comment: ${outcome.comment}`)
  if (outcome) {
    lines.push('', `– Triaged by ${outcome.decidedBy} | ${formatDate(outcome.decidedAt)}`)
  }
  return lines.join('\n')
}
