import { formatDateTime } from '@/lib/format'
import type { AuditEvent } from '@/lib/types'

export function AuditTrail({ events }: { events: AuditEvent[] }) {
  return (
    <section aria-labelledby="audit-heading" className="rounded-xl border bg-card p-5">
      <h2 id="audit-heading" className="text-sm font-semibold">Audit trail</h2>
      <ol className="mt-4 flex flex-col">
        {[...events].reverse().map((e, i, arr) => (
          <li key={`${e.at}-${i}`} className="relative flex gap-3 pb-4 last:pb-0">
            {i < arr.length - 1 && (
              <span className="absolute top-3 left-[3.5px] h-full w-px bg-border" aria-hidden="true" />
            )}
            <span className="relative mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <div className="min-w-0 text-sm">
              <p>
                <span className="font-medium">{e.actor}</span> · {e.action}
              </p>
              {e.detail && <p className="text-muted-foreground">{e.detail}</p>}
              <time dateTime={e.at} className="text-xs text-muted-foreground">
                {formatDateTime(e.at)}
              </time>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
