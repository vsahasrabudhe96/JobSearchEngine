export type VisaSponsorship = 'yes' | 'no' | 'unknown'

export interface JobPosting {
  externalId: string
  title: string
  company: string
  location?: string
  description?: string
  snippet?: string
  remote?: boolean
  jobType?: string
  salaryMin?: number
  salaryMax?: number
  salaryCurrency?: string
  applyUrl: string
  postedAt: Date
  visaSponsorship?: VisaSponsorship
}

export interface JobSearchQuery {
  keywords: string
  location?: string
  remote?: boolean
}

export interface JobSourceResult {
  jobs: JobPosting[]
  totalFound?: number
  hasMore?: boolean
  error?: string
}

export interface JobSourceConfig {
  id: string
  name: string
  enabled: boolean
  rateLimit?: {
    requestsPerMinute: number
  }
}

export interface IJobSource {
  readonly id: string
  readonly name: string
  fetchJobs(query: JobSearchQuery): Promise<JobSourceResult>
  isAvailable(): boolean
}

