import Link from 'next/link'
import { AlertTriangle, ChevronRight, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STATUS_LABELS, timeAgo } from '@/lib/format'
import type { Referral, ReferralStatus } from '@/lib/types'
import { StatusBadge, Tag, UrgencyMeter } from './referral-badges'

type Filter = ReferralStatus | 'all' | 'audit'

const UNLINKED_REFERRAL_IDS = new Set(['ref-1042', 'ref-1041', 'ref-1040', 'ref-1039', 'ref-1038'])

const FILTERS: Filter[] = ['all', 'new', 'in_review', 'triaged', 'booked', 'declined', 'audit']

function filterLabel(f: Filter) {
  if (f === 'all') return 'All'
  if (f === 'audit') return 'Audit queue'
  return STATUS_LABELS[f]
}

function matches(r: Referral, f: Filter) {
  if (f === 'all') return true
  if (f === 'audit') return Boolean(r.needsAudit)
  return r.status === f
}

export function ReferralQueue({
  referrals,
  activeStatus,
  sortByUrgency,
}: {
  referrals: Referral[]
  activeStatus: Filter
  sortByUrgency: boolean
}) {
  const visible = referrals.filter((r) => matches(r, activeStatus))
  if (sortByUrgency) visible.sort((a, b) => (b.final?.urgency ?? b.suggested.urgency) - (a.final?.urgency ?? a.suggested.urgency))

  const href = (status: Filter, sort = sortByUrgency) => {
    const params = new URLSearchParams()
    if (status !== 'all') params.set('status', status)
    if (sort) params.set('sort', 'urgency')
    const qs = params.toString()
    return qs ? `/?${qs}` : '/'
  }

  return (
    <section aria-labelledby="queue-heading" className="rounded-xl border bg-card">
      <h2 id="queue-heading" className="sr-only">Referrals</h2>
      <div className="flex flex-col gap-3 border-b p-3 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filter by status" className="flex gap-1 overflow-x-auto">
          {FILTERS.map((f) => {
            const count = referrals.filter((r) => matches(r, f)).length
            const active = f === activeStatus
            return (
              <Link
                key={f}
                href={href(f)}
                aria-current={active ? 'true' : undefined}
                className={cn(
                  'flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground',
                  active && 'bg-accent text-accent-foreground',
                )}
              >
                {filterLabel(f)}
                <span className="rounded bg-background/70 px-1 text-xs tabular-nums">{count}</span>
              </Link>
            )
          })}
        </nav>
        <Link
          href={href(activeStatus, !sortByUrgency)}
          className="self-start whitespace-nowrap text-sm font-medium text-primary hover:underline lg:self-auto"
        >
          {sortByUrgency ? 'Sort by newest' : 'Sort by urgency'}
        </Link>
      </div>

      {visible.length === 0 ? (
        <p className="px-4 py-12 text-center text-sm text-muted-foreground">No referrals in this view.</p>
      ) : (
        <ul className="divide-y">
          {visible.map((r) => {
            const urgency = r.final?.urgency ?? r.suggested.urgency
            const category = r.final?.category ?? r.suggested.category
            const content = (
              <>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-medium">{r.patient.name}</span>
                    <StatusBadge status={r.status} />
                    {r.needsAudit && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-warning-foreground">
                        <ShieldCheck className="size-3.5" aria-hidden="true" /> Audit
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{r.reason}</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {r.missingInfo.length > 0 && (
                      <Tag tone="alert">
                        <AlertTriangle className="mr-1 size-3" aria-hidden="true" />
                        {r.missingInfo.length} missing
                      </Tag>
                    )}
                    {r.tags.slice(0, 3).map((t) => (
                      <Tag key={t}>{t}</Tag>
                    ))}
                  </div>
                </div>
                <div className="hidden w-40 flex-col gap-1.5 sm:flex">
                  <UrgencyMeter value={urgency} />
                  <span className="text-xs text-muted-foreground">{category}</span>
                </div>
                <div className="hidden w-36 text-right text-xs text-muted-foreground md:block">
                  <p>{r.referringProvider.clinic}</p>
                  <p className="mt-0.5">{timeAgo(r.receivedAt)}</p>
                </div>
              </>
            )
            const isUnlinked = UNLINKED_REFERRAL_IDS.has(r.id)

            return (
              <li key={r.id}>
                {isUnlinked ? (
                  <div className="flex items-center gap-4 px-4 py-3.5">{content}</div>
                ) : (
                  <Link
                    href={`/referrals/${r.id}`}
                    className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
                  >
                    {content}
                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
