import type { IJobSource, JobSearchQuery, JobSourceResult, JobPosting } from './types'
import { inferVisaSponsorshipFromJob } from './visa-heuristics'

export abstract class BaseJobSource implements IJobSource {
  abstract readonly id: string
  abstract readonly name: string

  abstract fetchJobs(query: JobSearchQuery): Promise<JobSourceResult>
  abstract isAvailable(): boolean

  protected processJobPostings(jobs: JobPosting[]): JobPosting[] {
    return jobs.map(job => {
      if (!job.visaSponsorship || job.visaSponsorship === 'unknown') {
        return {
          ...job,
          visaSponsorship: inferVisaSponsorshipFromJob(job),
        }
      }
      return job
    })
  }

  protected generateDedupHash(job: JobPosting): string {
    const normalized = [
      job.title.toLowerCase().trim(),
      job.company.toLowerCase().trim(),
      (job.location || '').toLowerCase().trim(),
    ].join('|')

    let hash = 0
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(36)
  }
}
