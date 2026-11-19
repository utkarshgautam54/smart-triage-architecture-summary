import type { Referral } from '@/lib/types'

function formatDuration(minutes: number) {
  if (!Number.isFinite(minutes)) return '—'
  if (minutes < 60) return `${Math.round(minutes)}m`
  return `${(minutes / 60).toFixed(1)}h`
}

export function QueueStats({ referrals }: { referrals: Referral[] }) {
  const pending = referrals.filter((r) => r.status === 'new' || r.status === 'in_review')
  const ready = referrals.filter((r) => r.status === 'triaged')
  const urgentPending = pending.filter((r) => r.suggested.urgency >= 4).length
  const decided = referrals.filter((r) => r.final)
  const avgMinutes =
    decided.reduce((sum, r) => sum + (+new Date(r.final!.decidedAt) - +new Date(r.receivedAt)) / 60_000, 0) /
    decided.length
  const sources = new Map<string, number>()
  for (const r of referrals) sources.set(r.referringProvider.clinic, (sources.get(r.referringProvider.clinic) ?? 0) + 1)
  const topSource = [...sources.entries()].sort((a, b) => b[1] - a[1])[0]

  const stats = [
    { label: 'Awaiting triage', value: pending.length, hint: `${urgentPending} high urgency` },
    { label: 'Ready to book', value: ready.length, hint: 'Paste into EMR & book' },
    { label: 'Avg. time to triage', value: formatDuration(avgMinutes), hint: `Across ${decided.length} decisions` },
    { label: 'Top referral source', value: topSource?.[0] ?? '—', hint: topSource ? `${topSource[1]} referrals` : '' },
  ]

  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border bg-card p-4">
          <dt className="text-xs font-medium text-muted-foreground">{s.label}</dt>
          <dd className="mt-1.5 truncate text-xl font-semibold tracking-tight">{s.value}</dd>
          <dd className="mt-0.5 text-xs text-muted-foreground">{s.hint}</dd>
        </div>
      ))}
    </dl>
  )
}
