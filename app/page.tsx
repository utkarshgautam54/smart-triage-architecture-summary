import Link from 'next/link'
import { FileUp } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { QueueStats } from '@/components/queue-stats'
import { ReferralQueue } from '@/components/referral-queue'
import { listReferrals } from '@/lib/store'
import { REFERRAL_STATUSES, type ReferralStatus } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; sort?: string }>
}) {
  const { status, sort } = await searchParams
  const referrals = listReferrals()
  const activeStatus = REFERRAL_STATUSES.includes(status as ReferralStatus)
    ? (status as ReferralStatus)
    : status === 'audit'
      ? 'audit'
      : 'all'

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Triage queue</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Referrals picked up from your fax inbox, summarized and ready for a decision.
          </p>
        </div>
        <Link href="/intake" className={buttonVariants({ size: 'lg' })}>
          <FileUp aria-hidden="true" />
          Add referral
        </Link>
      </div>

      <QueueStats referrals={referrals} />
      <ReferralQueue referrals={referrals} activeStatus={activeStatus} sortByUrgency={sort === 'urgency'} />
    </div>
  )
}
