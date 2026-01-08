import { BaseJobSource } from '../base'
import type { JobSearchQuery, JobSourceResult, JobPosting, VisaSponsorship } from '../types'

interface ArbeitnowJob {
  slug: string
  company_name: string
  title: string
  description: string
  remote: boolean
  url: string
  tags: string[]
  job_types: string[]
  location: string
  created_at: number
}

interface ArbeitnowResponse {
  data: ArbeitnowJob[]
  links: {
    next?: string
  }
  meta: {
    total: number
  }
}

export class ArbeitnowProvider extends BaseJobSource {
  readonly id = 'arbeitnow'
  readonly name = 'Arbeitnow'
  
  private readonly baseUrl = 'https://www.arbeitnow.com/api/job-board-api'

  isAvailable(): boolean {
    return true
  }

  private inferVisaFromText(text: string): VisaSponsorship {
    const lower = text.toLowerCase()
    
    if (
      lower.includes('visa sponsorship') ||
      lower.includes('sponsorship available') ||
      lower.includes('will sponsor') ||
      lower.includes('relocation') ||
      lower.includes('sponsor visa')
    ) {
      return 'yes'
    }
    
    if (
      lower.includes('no sponsorship') ||
      lower.includes('cannot sponsor') ||
      lower.includes('no visa') ||
      lower.includes('eu citizens only') ||
      lower.includes('must have work permit')
    ) {
      return 'no'
    }
    
    return 'unknown'
  }

  async fetchJobs(query: JobSearchQuery): Promise<JobSourceResult> {
    try {
      const response = await fetch(this.baseUrl, {
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        return {
          jobs: [],
          error: `Arbeitnow API error: ${response.status}`,
        }
      }

      const data: ArbeitnowResponse = await response.json()
      
      // Filter by keywords if provided
      let filteredJobs = data.data
      if (query.keywords) {
        const keywords = query.keywords.toLowerCase().split(/\s+/)
        filteredJobs = data.data.filter(job => {
          const searchText = `${job.title} ${job.company_name} ${job.tags?.join(' ') || ''} ${job.description || ''}`.toLowerCase()
          return keywords.some(kw => searchText.includes(kw))
        })
      }

      // Filter by remote if specified
      if (query.remote) {
        filteredJobs = filteredJobs.filter(job => job.remote)
      }

      // Filter by location if provided
      if (query.location) {
        const locationLower = query.location.toLowerCase()
        filteredJobs = filteredJobs.filter(job => 
          job.location?.toLowerCase().includes(locationLower) ||
          (locationLower.includes('remote') && job.remote)
        )
      }

      const jobPostings: JobPosting[] = filteredJobs.slice(0, 50).map(job => {
        const description = job.description || ''
        const fullText = `${description} ${job.tags?.join(' ') || ''}`
        
        // Clean HTML from description
        const cleanDescription = description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
        
        return {
          externalId: `arbeitnow-${job.slug}`,
          title: job.title,
          company: job.company_name,
          location: job.remote ? 'Remote' : job.location,
          description: cleanDescription,
          snippet: cleanDescription.slice(0, 200) + '...',
          remote: job.remote,
          jobType: job.job_types?.[0] || 'full-time',
          applyUrl: job.url,
          postedAt: new Date(job.created_at * 1000),
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
        error: `Arbeitnow fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }
}

