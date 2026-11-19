import { IntakeForm } from '@/components/intake-form'
import { getSettings } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default function IntakePage() {
  const { mode } = getSettings()
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New referral</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
          Upload a faxed referral PDF to simulate an SRFax pickup. Smart Triage reads it, summarizes the clinical
          picture, flags missing info, and suggests a triage decision.
          {mode === 'autonomous' && ' AI-autonomous mode is on, so eligible referrals are finalized automatically.'}
        </p>
      </div>
      <IntakeForm />
    </div>
  )
}
