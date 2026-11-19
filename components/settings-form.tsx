'use client'

import { useActionState, useState } from 'react'
import { updateSettings } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { TRIAGE_CATEGORIES, type ClinicSettings, type TriageMode } from '@/lib/types'

const fieldClass =
  'rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30'

const MODES: { value: TriageMode; title: string; body: string }[] = [
  {
    value: 'manual',
    title: 'Manual physician review',
    body: 'Physicians approve every triage decision. Recommended default for complex specialties.',
  },
  {
    value: 'autonomous',
    title: 'AI-autonomous triage',
    body: 'Smart Triage finalizes eligible decisions automatically, with a physician audit queue.',
  },
]

export function SettingsForm({ settings }: { settings: ClinicSettings }) {
  const [state, action, pending] = useActionState(updateSettings, null)
  const [mode, setMode] = useState(settings.mode)

  return (
    <form action={action} className="flex flex-col gap-6">
      <section className="flex flex-col gap-1.5 rounded-xl border bg-card p-5">
        <label htmlFor="clinicName" className="text-sm font-semibold">Clinic name</label>
        <input id="clinicName" name="clinicName" required minLength={2} maxLength={100} defaultValue={settings.clinicName} className={fieldClass} />
      </section>

      <fieldset className="rounded-xl border bg-card p-5">
        <legend className="sr-only">Triage workflow mode</legend>
        <p className="text-sm font-semibold" aria-hidden="true">Triage workflow mode</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {MODES.map((m) => (
            <label
              key={m.value}
              className={cn(
                'flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/30',
                mode === m.value ? 'border-primary bg-accent/50' : 'hover:bg-muted/50',
              )}
            >
              <input
                type="radio"
                name="mode"
                value={m.value}
                checked={mode === m.value}
                onChange={() => setMode(m.value)}
                className="mt-0.5 accent-primary"
              />
              <span>
                <span className="block text-sm font-medium">{m.title}</span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{m.body}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset
        disabled={mode !== 'autonomous'}
        className="flex flex-col gap-5 rounded-xl border bg-card p-5 disabled:opacity-60"
      >
        <legend className="sr-only">Autonomous guardrails</legend>
        <div>
          <p className="text-sm font-semibold">Guardrails</p>
          <p className="mt-1 text-xs text-muted-foreground">Applies only in AI-autonomous mode.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="auditRate" className="text-xs font-medium text-muted-foreground">Physician audit rate (1 in N)</label>
            <input id="auditRate" name="auditRate" type="number" min={1} max={100} defaultValue={settings.auditRate} className={fieldClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="autoThreshold" className="text-xs font-medium text-muted-foreground">Auto-triage at or below urgency</label>
            <select id="autoThreshold" name="autoThreshold" defaultValue={settings.autoThreshold} className={fieldClass}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n} / 5</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Always AI-only categories</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {TRIAGE_CATEGORIES.map((c) => (
              <label key={c} className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm has-checked:border-primary has-checked:bg-accent/50">
                <input type="checkbox" name="aiOnlyCategories" value={c} defaultChecked={settings.aiOnlyCategories.includes(c)} className="accent-primary" />
                {c}
              </label>
            ))}
          </div>
        </div>
      </fieldset>
      {mode !== 'autonomous' && (
        <>
          <input type="hidden" name="auditRate" value={settings.auditRate} />
          <input type="hidden" name="autoThreshold" value={settings.autoThreshold} />
          {settings.aiOnlyCategories.map((c) => (
            <input key={c} type="hidden" name="aiOnlyCategories" value={c} />
          ))}
        </>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={pending}>Save settings</Button>
        {state && (
          <p role="status" className={cn('text-sm', state.ok ? 'text-primary' : 'text-destructive')}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  )
}
