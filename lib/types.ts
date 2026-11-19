export const REFERRAL_STATUSES = [
  'new',
  'in_review',
  'triaged',
  'declined',
  'booked',
] as const
export type ReferralStatus = (typeof REFERRAL_STATUSES)[number]

export const TRIAGE_CATEGORIES = [
  'Urgent',
  'Semi-urgent',
  'Routine',
  'Redirect',
  'Decline',
] as const
export type TriageCategory = (typeof TRIAGE_CATEGORIES)[number]

export type TriageMode = 'manual' | 'autonomous'
export type TriageDecision = 'accepted' | 'modified' | 'declined' | 'auto'

export interface AuditEvent {
  at: string
  actor: string
  action: string
  detail?: string
}

export interface TriageOutcome {
  category: TriageCategory
  action: string
  urgency: number
  comment?: string
  decision: TriageDecision
  decidedBy: string
  decidedAt: string
}

export interface Referral {
  id: string
  receivedAt: string
  source: 'SRFax' | 'Manual upload'
  faxNumber?: string
  pageCount: number
  patient: { name: string; dob: string; phn: string }
  referringProvider: { name: string; clinic: string }
  reason: string
  keyFindings: string[]
  missingInfo: string[]
  tags: string[]
  suggested: { category: TriageCategory; action: string; urgency: number }
  aiRationale: string
  status: ReferralStatus
  assignedTo?: string
  final?: TriageOutcome
  needsAudit?: boolean
  audit: AuditEvent[]
}

export interface ClinicSettings {
  clinicName: string
  mode: TriageMode
  auditRate: number
  autoThreshold: number
  aiOnlyCategories: TriageCategory[]
  physicians: string[]
}
