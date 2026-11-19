import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { AuditTrail } from '@/components/audit-trail'
import { DispositionPanel } from '@/components/disposition-panel'
import { StatusBadge } from '@/components/referral-badges'
import { TriageCard } from '@/components/triage-card'
import { TriagePanel } from '@/components/triage-panel'
import { buildDisposition, formatDateTime } from '@/lib/format'
import { getReferral, getSettings } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default async function ReferralPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const referral = getReferral(id)
  if (!referral) notFound()
  const settings = getSettings()
  const decided = referral.status !== 'new' && referral.status !== 'in_review'

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-3">
        <Link href="/" className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to queue
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{referral.patient.name}</h1>
          <StatusBadge status={referral.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          {referral.id.toUpperCase()} · Received {formatDateTime(referral.receivedAt)} via {referral.source}
          {referral.faxNumber ? ` from ${referral.faxNumber}` : ''} · {referral.pageCount}{' '}
          {referral.pageCount === 1 ? 'page' : 'pages'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-6">
          <TriageCard referral={referral} />
          <AuditTrail events={referral.audit} />
        </div>
        <div className="flex flex-col gap-6">
          {(!decided || referral.needsAudit) && (
            <TriagePanel referral={referral} physicians={settings.physicians} />
          )}
          {decided && (
            <DispositionPanel
              id={referral.id}
              status={referral.status}
              text={buildDisposition(referral)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
