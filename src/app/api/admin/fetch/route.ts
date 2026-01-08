import { NextRequest, NextResponse } from 'next/server'
import { fetchAllActiveSearches, fetchFromProvider } from '@/lib/job-service'
import { jobSourceRegistry } from '@/lib/sources'

function verifyApiKey(request: NextRequest): boolean {
  const apiKey = process.env.ADMIN_API_KEY
  if (!apiKey) return process.env.NODE_ENV !== 'production'
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false
  const [type, token] = authHeader.split(' ')
  return type === 'Bearer' && token === apiKey
}

export async function POST(request: NextRequest) {
  if (!verifyApiKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    let results
    const contentType = request.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      const body = await request.json().catch(() => ({}))
      if (body.providerId) {
        results = [await fetchFromProvider(body.providerId, { keywords: body.keywords || '', location: body.location, remote: body.remote }, null)]
      } else {
        results = await fetchAllActiveSearches()
      }
    } else {
      results = await fetchAllActiveSearches()
    }

    const summary = { totalFetches: results.length, successful: results.filter(r => r.success).length, failed: results.filter(r => !r.success).length, totalJobsFound: results.reduce((sum, r) => sum + r.jobsFound, 0), totalNewJobs: results.reduce((sum, r) => sum + r.jobsNew, 0) }
    return NextResponse.json({ success: true, summary, results })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  if (!verifyApiKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const providers = jobSourceRegistry.getAll().map(p => ({ id: p.id, name: p.name, available: p.isAvailable() }))
  return NextResponse.json({ providers })
}
