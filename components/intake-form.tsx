'use client'

import { useActionState, useState } from 'react'
import { FileText, Loader2, Upload } from 'lucide-react'
import { ingestReferral } from '@/app/actions'
import { Button } from '@/components/ui/button'

const SAMPLE = `REFERRAL — Delta Medical Clinic, Dr. Lin, fax 604-555-0142
Patient: Priya Sharma  DOB: 1964-09-12  PHN: 9221 873 004
Reason: Please assess for recurrent syncope x3 over past month, last episode while driving.
PMHx: HTN on amlodipine 5 mg. No known cardiac history.
ECG (Nov 2026): sinus rhythm, borderline QTc 470 ms.
No echo on file. Bloodwork pending.`

export function IntakeForm() {
  const [state, action, pending] = useActionState(ingestReferral, null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [text, setText] = useState('')

  return (
    <form action={action} className="flex flex-col gap-5 rounded-xl border bg-card p-5">
      <label
        htmlFor="file"
        className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-accent/40 has-focus-visible:border-ring"
      >
        {fileName ? (
          <FileText className="size-8 text-primary" aria-hidden="true" />
        ) : (
          <Upload className="size-8 text-muted-foreground" aria-hidden="true" />
        )}
        <span className="text-sm font-medium">{fileName ?? 'Choose a referral PDF'}</span>
        <span className="text-xs text-muted-foreground">PDF up to 10 MB</span>
        <input
          id="file"
          name="file"
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
      </label>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or paste referral text
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="text" className="text-xs font-medium text-muted-foreground">Referral text</label>
          <button type="button" onClick={() => setText(SAMPLE)} className="text-xs font-medium text-primary hover:underline">
            Use sample referral
          </button>
        </div>
        <textarea
          id="text"
          name="text"
          rows={7}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-lg border bg-background px-3 py-2 font-mono text-xs leading-relaxed outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
        />
      </div>

      {state?.error && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        {pending ? 'Reading referral…' : 'Summarize & triage'}
      </Button>
    </form>
  )
}
