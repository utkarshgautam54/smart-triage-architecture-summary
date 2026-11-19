'use client'

import { useState, useTransition } from 'react'
import { Check, PencilLine, X } from 'lucide-react'
import { acceptTriage, declineTriage, modifyTriage, startReview } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { TRIAGE_CATEGORIES, type Referral } from '@/lib/types'
import { URGENCY_LABELS } from '@/lib/format'

type Mode = 'idle' | 'modify' | 'decline'

const fieldClass =
  'w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30'

export function TriagePanel({ referral, physicians }: { referral: Referral; physicians: string[] }) {
  const [physician, setPhysician] = useState(referral.assignedTo ?? physicians[0])
  const [mode, setMode] = useState<Mode>('idle')
  const [pending, startTransition] = useTransition()
  const isAudit = referral.final?.decision === 'auto'

  const run = (fn: () => Promise<void>) => startTransition(() => fn())

  return (
    <section aria-labelledby="triage-heading" className="rounded-xl border bg-card p-5">
      <h2 id="triage-heading" className="text-sm font-semibold">
        {isAudit ? 'Physician audit' : 'Physician triage'}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {isAudit
          ? 'This referral was auto-triaged and selected for quality spot-check.'
          : 'Review the AI suggestion and record your decision.'}
      </p>

      <div className="mt-4 flex flex-col gap-1.5">
        <label htmlFor="physician" className="text-xs font-medium text-muted-foreground">
          Triaging physician
        </label>
        <select
          id="physician"
          value={physician}
          onChange={(e) => setPhysician(e.target.value)}
          className={fieldClass}
        >
          {physicians.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </div>

      {referral.status === 'new' && (
        <Button
          variant="outline"
          className="mt-3 w-full"
          disabled={pending}
          onClick={() => run(() => startReview(referral.id, physician))}
        >
          Claim for review
        </Button>
      )}

      {mode === 'idle' && (
        <div className="mt-4 flex flex-col gap-2">
          <Button size="lg" disabled={pending} onClick={() => run(() => acceptTriage(referral.id, physician))}>
            <Check aria-hidden="true" /> Accept suggested triage
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="lg" disabled={pending} onClick={() => setMode('modify')}>
              <PencilLine aria-hidden="true" /> Modify
            </Button>
            <Button variant="destructive" size="lg" disabled={pending} onClick={() => setMode('decline')}>
              <X aria-hidden="true" /> Decline
            </Button>
          </div>
        </div>
      )}

      {mode === 'modify' && (
        <form
          action={(fd) => run(() => modifyTriage(fd))}
          className="mt-4 flex flex-col gap-3"
        >
          <input type="hidden" name="id" value={referral.id} />
          <input type="hidden" name="physician" value={physician} />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="category" className="text-xs font-medium text-muted-foreground">Category</label>
              <select id="category" name="category" defaultValue={referral.suggested.category} className={fieldClass}>
                {TRIAGE_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="urgency" className="text-xs font-medium text-muted-foreground">Urgency</label>
              <select id="urgency" name="urgency" defaultValue={referral.suggested.urgency} className={fieldClass}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} – {URGENCY_LABELS[n]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="action" className="text-xs font-medium text-muted-foreground">Action for admin</label>
            <input id="action" name="action" required minLength={3} maxLength={200} defaultValue={referral.suggested.action} className={fieldClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="comment" className="text-xs font-medium text-muted-foreground">Comment for admin (optional)</label>
            <textarea id="comment" name="comment" rows={3} maxLength={500} className={fieldClass} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="lg" className="flex-1" disabled={pending}>Complete triage</Button>
            <Button type="button" variant="ghost" size="lg" onClick={() => setMode('idle')}>Cancel</Button>
          </div>
        </form>
      )}

      {mode === 'decline' && (
        <form action={(fd) => run(() => declineTriage(fd))} className="mt-4 flex flex-col gap-3">
          <input type="hidden" name="id" value={referral.id} />
          <input type="hidden" name="physician" value={physician} />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="decline-comment" className="text-xs font-medium text-muted-foreground">Reason for declining</label>
            <textarea id="decline-comment" name="comment" rows={3} required minLength={3} maxLength={500} className={fieldClass} placeholder="e.g. Manageable in primary care; suggest repeat labs in 3 months." />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="destructive" size="lg" className="flex-1" disabled={pending}>Decline referral</Button>
            <Button type="button" variant="ghost" size="lg" onClick={() => setMode('idle')}>Cancel</Button>
          </div>
        </form>
      )}
    </section>
  )
}
