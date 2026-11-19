import 'server-only'
import type { ClinicSettings, Referral } from './types'
import { seedReferrals } from './seed'

interface Store {
  referrals: Referral[]
  settings: ClinicSettings
  autoCounter: number
}

const globalStore = globalThis as unknown as { __smartTriage?: Store }

function store(): Store {
  if (!globalStore.__smartTriage) {
    globalStore.__smartTriage = {
      referrals: seedReferrals(),
      settings: {
        clinicName: 'Riverside Internal Medicine',
        mode: 'manual',
        auditRate: 10,
        autoThreshold: 2,
        aiOnlyCategories: ['Routine'],
        physicians: ['Dr. A. Patel', 'Dr. M. Chen', 'Dr. S. Okafor'],
      },
      autoCounter: 0,
    }
  }
  return globalStore.__smartTriage
}

export function listReferrals() {
  return [...store().referrals].sort(
    (a, b) => +new Date(b.receivedAt) - +new Date(a.receivedAt),
  )
}

export function getReferral(id: string) {
  return store().referrals.find((r) => r.id === id)
}

export function saveReferral(referral: Referral) {
  const s = store()
  const index = s.referrals.findIndex((r) => r.id === referral.id)
  if (index === -1) s.referrals.push(referral)
  else s.referrals[index] = referral
}

export function getSettings() {
  return store().settings
}

export function setSettings(settings: ClinicSettings) {
  store().settings = settings
}

export function nextAutoCount() {
  store().autoCounter += 1
  return store().autoCounter
}
