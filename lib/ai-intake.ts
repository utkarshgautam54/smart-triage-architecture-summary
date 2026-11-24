import 'server-only'
import { generateText, Output } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { TRIAGE_CATEGORIES } from './types'

const referralSchema = z.object({
  patient: z.object({
    name: z.string().describe('Full patient name, or "Unknown"'),
    dob: z.string().describe('Date of birth as YYYY-MM-DD, or "1900-01-01" if unknown'),
    phn: z.string().describe('Personal health number, or "Not provided"'),
  }),
  referringProvider: z.object({
    name: z.string(),
    clinic: z.string(),
  }),
  reason: z.string().describe('One-sentence reason for referral'),
  keyFindings: z.array(z.string()).describe('Key labs, vitals, meds, findings with dates'),
  missingInfo: z.array(z.string()).describe('Information a specialist would need that is absent or outdated'),
  tags: z.array(z.string()).describe('2-4 short tags such as condition names, "Urgent", "Needs labs"'),
  suggested: z.object({
    category: z.enum(TRIAGE_CATEGORIES),
    action: z.string().describe('Concrete next step for the admin, e.g. "Book GIM consult within 4 weeks"'),
    urgency: z.number().int().min(1).max(5),
  }),
  aiRationale: z.string().describe('1-2 sentences explaining the suggested triage'),
})

export type ParsedReferral = z.infer<typeof referralSchema>

const INSTRUCTIONS = `You are a clinical referral triage assistant for a Canadian General Internal Medicine clinic.
Extract structured information from the referral exactly as documented. Never invent values; use the provided placeholders when absent.
Suggest a triage category and urgency (1 = very low, 5 = critical) using standard red-flag reasoning. Your output is a suggestion for physician review.`

export async function parseReferral(
  input: { kind: 'pdf'; data: Uint8Array; filename: string } | { kind: 'text'; text: string },
) {
  const { output } = await generateText({
    model: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? google('gemini-3.5-flash') : 'google/gemini-3.5-flash',
    instructions: INSTRUCTIONS,
    output: Output.object({ schema: referralSchema }),
    messages: [
      {
        role: 'user',
        content:
          input.kind === 'pdf'
            ? [
                { type: 'text', text: 'Summarize and triage this faxed referral.' },
                { type: 'file', mediaType: 'application/pdf', data: input.data, filename: input.filename },
              ]
            : [{ type: 'text', text: `Summarize and triage this referral:\n\n${input.text}` }],
      },
    ],
  })
  return output
}
