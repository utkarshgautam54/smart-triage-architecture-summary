'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, FileUp, Inbox, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TriageMode } from '@/lib/types'

const LINKS = [
  { href: '/', label: 'Triage queue', icon: Inbox },
  { href: '/intake', label: 'New referral', icon: FileUp },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function AppNav({ clinicName, mode }: { clinicName: string; mode: TriageMode }) {
  const pathname = usePathname()
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' || pathname.startsWith('/referrals') : pathname.startsWith(href)

  return (
    <header className="flex shrink-0 flex-col gap-4 border-b bg-card px-4 py-4 md:sticky md:top-0 md:h-dvh md:w-64 md:border-r md:border-b-0 md:px-5 md:py-6">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Activity className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-semibold leading-tight">Smart Triage</p>
          <p className="truncate text-xs text-muted-foreground">{clinicName}</p>
        </div>
      </div>

      <nav aria-label="Main" className="flex gap-1 overflow-x-auto md:flex-col">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(href) ? 'page' : undefined}
            className={cn(
              'flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
              isActive(href) && 'bg-accent text-accent-foreground',
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="hidden rounded-lg border bg-muted/60 p-3 md:mt-auto md:block">
        <p className="text-xs font-medium text-muted-foreground">Triage mode</p>
        <p className="mt-1 flex items-center gap-2 text-sm font-medium">
          <span
            className={cn('size-2 rounded-full', mode === 'manual' ? 'bg-primary' : 'bg-warning')}
            aria-hidden="true"
          />
          {mode === 'manual' ? 'Physician review' : 'AI-autonomous'}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Reads from SRFax. EMR remains the system of record.
        </p>
      </div>
    </header>
  )
}
