import { SettingsForm } from '@/components/settings-form'
import { getSettings } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Clinic settings</h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          Start with physician oversight, then promote Smart Triage to an autonomous engine as trust builds.
        </p>
      </div>
      <SettingsForm settings={getSettings()} />
    </div>
  )
}
