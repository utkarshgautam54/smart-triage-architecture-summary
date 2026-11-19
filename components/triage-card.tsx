import { AlertTriangle, Sparkles } from 'lucide-react'
import { formatDate } from '@/lib/format'
import type { Referral } from '@/lib/types'
import { Tag, UrgencyMeter } from './referral-badges'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm">{children}</dd>
    </div>
  )
}

export function TriageCard({ referral: r }: { referral: Referral }) {
  return (
    <article className="rounded-xl border bg-card">
      <div className="border-b p-5">
        <h2 className="text-sm font-semibold">Referral summary</h2>
        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Patient">{r.patient.name}</Field>
          <Field label="DOB">{formatDate(r.patient.dob)}</Field>
          <Field label="PHN">
            <span className="font-mono">{r.patient.phn}</span>
          </Field>
          <Field label="Referring provider">
            {r.referringProvider.name}, {r.referringProvider.clinic}
          </Field>
        </dl>
      </div>

      <div className="flex flex-col gap-5 p-5">
        <div>
          <h3 className="text-xs font-medium text-muted-foreground">Reason for referral</h3>
          <p className="mt-1 text-pretty font-medium">{r.reason}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {r.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-medium text-muted-foreground">Key findings</h3>
          <ul className="mt-1.5 flex flex-col gap-1 text-sm">
            {r.keyFindings.map((f) => (
              <li key={f} className="flex gap-2">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground" aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {r.missingInfo.length > 0 && (
          <div className="rounded-lg bg-destructive/5 p-3 ring-1 ring-destructive/20 ring-inset">
            <h3 className="flex items-center gap-1.5 text-sm font-medium text-destructive">
              <AlertTriangle className="size-4" aria-hidden="true" /> Smart flag: missing information
            </h3>
            <ul className="mt-1.5 flex flex-col gap-0.5 pl-5.5 text-sm">
              {r.missingInfo.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-lg bg-accent/60 p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-medium text-accent-foreground">
            <Sparkles className="size-4" aria-hidden="true" /> AI-suggested triage
          </h3>
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
            <p className="font-semibold">
              {r.suggested.category} <span className="font-normal text-muted-foreground">→</span> {r.suggested.action}
            </p>
            <UrgencyMeter value={r.suggested.urgency} showLabel />
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.aiRationale}</p>
        </div>
      </div>
    </article>
  )
}
