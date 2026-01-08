import { BaseJobSource } from '../base'
import type { JobSearchQuery, JobSourceResult, JobPosting } from '../types'

const COMPANIES = [
  'TechCorp Inc.', 'Digital Solutions Ltd.', 'Cloud Nine Systems',
  'Data Dynamics', 'Innovative Labs', 'Future Technologies',
  'Smart Software Co.', 'DevOps Masters', 'AI Ventures',
  'CodeCraft Studios', 'Quantum Computing Corp', 'Neural Networks Inc.',
]

const TITLES = [
  'Senior Software Engineer', 'Full Stack Developer', 'Frontend Engineer',
  'Backend Developer', 'DevOps Engineer', 'Data Scientist',
  'Machine Learning Engineer', 'Product Manager', 'Engineering Manager',
  'Site Reliability Engineer', 'Cloud Architect', 'Security Engineer',
]

const LOCATIONS = [
  'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX',
  'Boston, MA', 'Denver, CO', 'Chicago, IL', 'Remote',
]

const DESCRIPTIONS = [
  'We are looking for a talented engineer to join our growing team. Visa sponsorship available for qualified candidates.',
  'Join our innovative team and help shape the future of technology. Must be authorized to work in the US.',
  'Exciting opportunity to work with modern tech stack. H1B sponsorship provided for exceptional candidates.',
  'Be part of a fast-growing startup with amazing culture. No visa sponsorship available at this time.',
  'Leading tech company seeking experienced professionals. Will sponsor visa for the right candidate.',
]

export class MockJobProvider extends BaseJobSource {
  readonly id = 'mock'
  readonly name = 'Mock Jobs'

  isAvailable(): boolean {
    return true
  }

  async fetchJobs(query: JobSearchQuery): Promise<JobSourceResult> {
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))

    const jobCount = 5 + Math.floor(Math.random() * 10)
    const jobs: JobPosting[] = []

    for (let i = 0; i < jobCount; i++) {
      const company = COMPANIES[Math.floor(Math.random() * COMPANIES.length)]
      const baseTitle = TITLES[Math.floor(Math.random() * TITLES.length)]
      const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]
      const description = DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)]
      
      const title = query.keywords && Math.random() > 0.5
        ? `${baseTitle} - ${query.keywords.split(' ')[0]}`
        : baseTitle

      const daysAgo = Math.floor(Math.random() * 10)
      const postedAt = new Date()
      postedAt.setDate(postedAt.getDate() - daysAgo)

      const isRemote = location === 'Remote' || Math.random() > 0.7

      jobs.push({
        externalId: `mock-${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`,
        title,
        company,
        location: isRemote ? 'Remote' : location,
        description,
        snippet: description.slice(0, 150) + '...',
        remote: isRemote,
        jobType: Math.random() > 0.2 ? 'full-time' : 'contract',
        salaryMin: 80000 + Math.floor(Math.random() * 100000),
        salaryMax: 120000 + Math.floor(Math.random() * 150000),
        salaryCurrency: 'USD',
        applyUrl: `https://example.com/apply/${Math.random().toString(36).slice(2)}`,
        postedAt,
      })
    }

    let filteredJobs = jobs
    if (query.location) {
      const locationLower = query.location.toLowerCase()
      filteredJobs = jobs.filter(job => 
        job.location?.toLowerCase().includes(locationLower) ||
        (locationLower.includes('remote') && job.remote)
      )
    }

    if (query.remote) {
      filteredJobs = filteredJobs.filter(job => job.remote)
    }

    return {
      jobs: this.processJobPostings(filteredJobs),
      totalFound: filteredJobs.length,
      hasMore: false,
    }
  }
}
