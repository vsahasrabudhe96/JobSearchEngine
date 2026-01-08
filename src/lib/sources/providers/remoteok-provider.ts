import { BaseJobSource } from '../base'
import type { JobSearchQuery, JobSourceResult, JobPosting, VisaSponsorship } from '../types'

interface RemoteOKJob {
  id: string
  epoch: number
  company: string
  company_logo?: string
  position: string
  tags?: string[]
  description?: string
  location?: string
  salary_min?: number
  salary_max?: number
  url: string
  apply_url?: string
}

export class RemoteOKProvider extends BaseJobSource {
  readonly id = 'remoteok'
  readonly name = 'RemoteOK'
  
  private readonly baseUrl = 'https://remoteok.com/api'

  isAvailable(): boolean {
    return true
  }

  private inferVisaFromText(text: string): VisaSponsorship {
    const lower = text.toLowerCase()
    
    if (
      lower.includes('visa sponsorship') ||
      lower.includes('sponsorship available') ||
      lower.includes('will sponsor') ||
      lower.includes('h1b sponsor') ||
      lower.includes('sponsor visa')
    ) {
      return 'yes'
    }
    
    if (
      lower.includes('no sponsorship') ||
      lower.includes('cannot sponsor') ||
      lower.includes('no visa') ||
      lower.includes('must be authorized') ||
      lower.includes('us citizens only') ||
      lower.includes('no h1b')
    ) {
      return 'no'
    }
    
    return 'unknown'
  }

  async fetchJobs(query: JobSearchQuery): Promise<JobSourceResult> {
    try {
      const response = await fetch(this.baseUrl, {
        headers: {
          'User-Agent': 'JobFinder/1.0',
        },
      })

      if (!response.ok) {
        return {
          jobs: [],
          error: `RemoteOK API error: ${response.status}`,
        }
      }

      const data: RemoteOKJob[] = await response.json()
      
      // First item is metadata, skip it
      const jobs = data.slice(1)
      
      // Filter by keywords if provided
      let filteredJobs = jobs
      if (query.keywords) {
        const keywords = query.keywords.toLowerCase().split(/\s+/)
        filteredJobs = jobs.filter(job => {
          const searchText = `${job.position} ${job.company} ${job.tags?.join(' ') || ''} ${job.description || ''}`.toLowerCase()
          return keywords.some(kw => searchText.includes(kw))
        })
      }

      const jobPostings: JobPosting[] = filteredJobs.slice(0, 50).map(job => {
        const description = job.description || ''
        const tagsText = job.tags?.join(', ') || ''
        const fullText = `${description} ${tagsText}`
        
        return {
          externalId: `remoteok-${job.id}`,
          title: job.position,
          company: job.company,
          location: job.location || 'Remote',
          description: description,
          snippet: description.slice(0, 200).replace(/<[^>]*>/g, '') + '...',
          remote: true,
          jobType: 'full-time',
          salaryMin: job.salary_min,
          salaryMax: job.salary_max,
          salaryCurrency: 'USD',
          applyUrl: job.apply_url || job.url,
          postedAt: new Date(job.epoch * 1000),
          visaSponsorship: this.inferVisaFromText(fullText),
        }
      })

      return {
        jobs: this.processJobPostings(jobPostings),
        totalFound: filteredJobs.length,
        hasMore: filteredJobs.length > 50,
      }
    } catch (error) {
      return {
        jobs: [],
        error: `RemoteOK fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }
}

