import { NextRequest, NextResponse } from 'next/server'
import { getRecentJobs } from '@/lib/job-service'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const searchId = searchParams.get('searchId') || undefined
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const { jobs, total } = await getRecentJobs({ searchId, limit: Math.min(limit, 100), offset })
    return NextResponse.json({ jobs, total, limit, offset, hasMore: offset + jobs.length < total })
  } catch (error) {
    console.error('Jobs API error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to fetch jobs', details: message }, { status: 500 })
  }
}
