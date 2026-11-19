'use client'

import { useState, useTransition } from 'react'
import { CalendarCheck, Check, Copy } from 'lucide-react'
import { logCopied, markBooked } from '@/app/actions'
import { Button } from '@/components/ui/button'
import type { ReferralStatus } from '@/lib/types'

export function DispositionPanel({ id, status, text }: { id: string; status: ReferralStatus; text: string }) {
  const [copied, setCopied] = useState(false)
  const [pending, startTransition] = useTransition()

  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    startTransition(() => logCopied(id))
  }

  return (
    <section aria-labelledby="disposition-heading" className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 id="disposition-heading" className="text-sm font-semibold">EMR disposition</h2>
        <Button variant="outline" size="sm" onClick={copy}>
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Paste into the EMR referral note before booking.</p>
      <pre className="mt-3 overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
        {text}
      </pre>
      <span className="sr-only" aria-live="polite">{copied ? 'Disposition copied to clipboard' : ''}</span>
      {status === 'triaged' && (
        <Button size="lg" className="mt-3 w-full" disabled={pending} onClick={() => startTransition(() => markBooked(id))}>
          <CalendarCheck aria-hidden="true" /> Mark as booked
        </Button>
      )}
    </section>
  )
}
