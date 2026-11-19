import { cn } from '@/lib/utils'
import { STATUS_LABELS, URGENCY_LABELS } from '@/lib/format'
import type { ReferralStatus } from '@/lib/types'

const STATUS_STYLES: Record<ReferralStatus, string> = {
  new: 'bg-secondary text-secondary-foreground ring-border',
  in_review: 'bg-warning/15 text-warning-foreground ring-warning/40',
  triaged: 'bg-primary/10 text-primary ring-primary/30',
  declined: 'bg-muted text-muted-foreground ring-border',
  booked: 'bg-foreground text-background ring-foreground',
}

export function StatusBadge({ status }: { status: ReferralStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap',
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

export function UrgencyMeter({ value, showLabel = false }: { value: number; showLabel?: boolean }) {
  const tone = value >= 5 ? 'bg-destructive' : value >= 4 ? 'bg-warning' : 'bg-primary'
  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex gap-0.5" role="img" aria-label={`Urgency ${value} of 5, ${URGENCY_LABELS[value]}`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={cn('h-3 w-1.5 rounded-sm', n <= value ? tone : 'bg-border')} />
        ))}
      </span>
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground">
          {URGENCY_LABELS[value]} ({value}/5)
        </span>
      )}
    </span>
  )
}

export function Tag({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'alert' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium',
        tone === 'alert' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground',
      )}
    >
      {children}
    </span>
  )
}
