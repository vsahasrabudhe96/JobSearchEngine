import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getJobsForMatching } from '@/lib/job-service'
import { getTopRecommendations } from '@/lib/matching'
import type { ResumeProfile } from '@/lib/resume'
import type { ProfileForMatching, JobForMatching } from '@/lib/matching'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const resumeId = searchParams.get('resumeId')
    const searchId = searchParams.get('searchId') || undefined
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    if (!resumeId) return NextResponse.json({ error: 'resumeId is required' }, { status: 400 })

    const resume = await prisma.resume.findUnique({ where: { id: resumeId } })
    if (!resume) return NextResponse.json({ error: 'Resume not found' }, { status: 404 })

    let profile: ResumeProfile
    try { profile = JSON.parse(resume.profileJson) } catch { return NextResponse.json({ error: 'Invalid resume profile data' }, { status: 400 }) }

    const matchingProfile: ProfileForMatching = { skills: profile.skills || [], keywords: profile.keywords || [], jobTitles: profile.jobTitles || [], preferredLocation: profile.preferredLocation, openToRemote: profile.openToRemote }

    const jobs = await getJobsForMatching(searchId)
    if (jobs.length === 0) return NextResponse.json({ recommendations: [], total: 0, message: 'No jobs found in the last 7 days' })

    const jobsForMatching: JobForMatching[] = jobs.map(j => ({ id: j.id, title: j.title, company: j.company, location: j.location, description: j.description, snippet: j.snippet, remote: j.remote }))

    const scoredJobs = getTopRecommendations(matchingProfile, jobsForMatching, limit)

    const jobIds = scoredJobs.map(s => s.jobId)
    const fullJobs = await prisma.job.findMany({ where: { id: { in: jobIds } } })
    const jobMap = new Map(fullJobs.map(j => [j.id, j]))

    const recommendations = scoredJobs.map(scored => ({ job: jobMap.get(scored.jobId), score: scored.score, breakdown: scored.breakdown })).filter(r => r.job !== undefined)

    return NextResponse.json({ recommendations, total: recommendations.length, totalJobs: jobs.length })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 })
  }
}
