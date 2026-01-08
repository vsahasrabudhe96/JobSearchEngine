import type { VisaSponsorship } from './types'

const VISA_YES_PATTERNS = [
  /visa\s+sponsor/i,
  /will\s+sponsor/i,
  /sponsorship\s+available/i,
  /sponsorship\s+provided/i,
  /sponsor\s+visa/i,
  /h1b\s+sponsor/i,
  /h-1b\s+sponsor/i,
  /immigration\s+sponsor/i,
  /work\s+authorization\s+sponsor/i,
  /we\s+sponsor/i,
  /offers?\s+sponsorship/i,
  /provides?\s+sponsorship/i,
  /open\s+to\s+sponsor/i,
]

const VISA_NO_PATTERNS = [
  /no\s+visa\s+sponsor/i,
  /not\s+sponsor/i,
  /cannot\s+sponsor/i,
  /can't\s+sponsor/i,
  /won't\s+sponsor/i,
  /will\s+not\s+sponsor/i,
  /unable\s+to\s+sponsor/i,
  /sponsorship\s+not\s+available/i,
  /no\s+sponsorship/i,
  /without\s+sponsor/i,
  /must\s+be\s+authorized/i,
  /must\s+have\s+work\s+authorization/i,
  /authorized\s+to\s+work.*without\s+sponsor/i,
  /no\s+h1b/i,
  /no\s+h-1b/i,
  /us\s+citizen.*only/i,
  /citizens?\s+only/i,
  /permanent\s+resident.*only/i,
  /green\s+card.*required/i,
]

export function inferVisaSponsorship(text: string | undefined | null): VisaSponsorship {
  if (!text) return 'unknown'
  const normalizedText = text.toLowerCase()

  for (const pattern of VISA_NO_PATTERNS) {
    if (pattern.test(normalizedText)) return 'no'
  }

  for (const pattern of VISA_YES_PATTERNS) {
    if (pattern.test(normalizedText)) return 'yes'
  }

  return 'unknown'
}

export function inferVisaSponsorshipFromJob(job: {
  title?: string
  description?: string
  snippet?: string
}): VisaSponsorship {
  const combinedText = [
    job.title || '',
    job.description || '',
    job.snippet || '',
  ].join(' ')
  return inferVisaSponsorship(combinedText)
}
