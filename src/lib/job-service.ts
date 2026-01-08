import { prisma } from './db'
import { jobSourceRegistry } from './sources'
import type { JobSearchQuery, JobPosting } from './sources'
import { inferVisaSponsorshipFromJob } from './sources'
import { generateJobDedupHash, getSevenDaysAgo } from './utils'

export interface FetchResult {
  searchId: string | null
  provider: string
  success: boolean
  jobsFound: number
  jobsNew: number
  error?: string
  durationMs: number
}

export async function fetchJobsForSearch(searchId: string): Promise<FetchResult[]> {
  const search = await prisma.search.findUnique({ where: { id: searchId } })
  if (!search) throw new Error(`Search not found: ${searchId}`)

  const providerIds = JSON.parse(search.providers) as string[]
  const providers = jobSourceRegistry.getByIds(providerIds)
  const query: JobSearchQuery = { keywords: search.keywords, location: search.location || undefined, remote: search.remote }

  const results: FetchResult[] = []
  for (const provider of providers) {
    results.push(await fetchFromProvider(provider.id, query, searchId))
  }
  return results
}

export async function fetchFromProvider(providerId: string, query: JobSearchQuery, searchId: string | null = null): Promise<FetchResult> {
  const provider = jobSourceRegistry.get(providerId)
  if (!provider) return { searchId, provider: providerId, success: false, jobsFound: 0, jobsNew: 0, error: `Provider not found: ${providerId}`, durationMs: 0 }

  const startTime = Date.now()
  try {
    const result = await provider.fetchJobs(query)
    if (result.error) throw new Error(result.error)

    const newJobCount = await storeJobs(result.jobs, providerId, searchId)
    const durationMs = Date.now() - startTime

    await prisma.fetchLog.create({ data: { searchId, provider: providerId, success: true, jobsFound: result.jobs.length, jobsNew: newJobCount, durationMs } })
    return { searchId, provider: providerId, success: true, jobsFound: result.jobs.length, jobsNew: newJobCount, durationMs }
  } catch (error) {
    const durationMs = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    await prisma.fetchLog.create({ data: { searchId, provider: providerId, success: false, error: errorMessage, durationMs } })
    return { searchId, provider: providerId, success: false, jobsFound: 0, jobsNew: 0, error: errorMessage, durationMs }
  }
}

async function storeJobs(jobs: JobPosting[], source: string, searchId: string | null): Promise<number> {
  let newCount = 0
  for (const job of jobs) {
    const dedupHash = generateJobDedupHash(job.title, job.company, job.location)
    const visaSponsorship = job.visaSponsorship || inferVisaSponsorshipFromJob(job)

    try {
      const dbJob = await prisma.job.upsert({
        where: { dedupHash },
        create: { externalId: job.externalId, source, title: job.title, company: job.company, location: job.location, description: job.description, snippet: job.snippet, remote: job.remote || false, jobType: job.jobType, salaryMin: job.salaryMin, salaryMax: job.salaryMax, salaryCurrency: job.salaryCurrency, applyUrl: job.applyUrl, postedAt: job.postedAt, visaSponsorship, dedupHash },
        update: { description: job.description, snippet: job.snippet, applyUrl: job.applyUrl, visaSponsorship },
      })

      if (searchId) {
        await prisma.searchJob.upsert({
          where: { searchId_jobId: { searchId, jobId: dbJob.id } },
          create: { searchId, jobId: dbJob.id },
          update: {},
        })
      }

      if (dbJob.createdAt.getTime() >= Date.now() - 5000) newCount++
    } catch (error) {
      console.error(`Error storing job: ${job.title} at ${job.company}`, error)
    }
  }
  return newCount
}

export async function fetchAllActiveSearches(): Promise<FetchResult[]> {
  const searches = await prisma.search.findMany({ where: { isActive: true } })
  const allResults: FetchResult[] = []
  for (const search of searches) {
    allResults.push(...await fetchJobsForSearch(search.id))
  }
  return allResults
}

export async function getRecentJobs(options: { searchId?: string; limit?: number; offset?: number }) {
  const sevenDaysAgo = getSevenDaysAgo()
  const where: any = { postedAt: { gte: sevenDaysAgo } }
  if (options.searchId) where.searches = { some: { searchId: options.searchId } }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({ where, orderBy: { postedAt: 'desc' }, take: options.limit || 50, skip: options.offset || 0 }),
    prisma.job.count({ where }),
  ])
  return { jobs, total }
}

export async function getJobsForMatching(searchId?: string) {
  const sevenDaysAgo = getSevenDaysAgo()
  const where: any = { postedAt: { gte: sevenDaysAgo } }
  if (searchId) where.searches = { some: { searchId } }

  return prisma.job.findMany({ where, select: { id: true, title: true, company: true, location: true, description: true, snippet: true, remote: true } })
}
