/**
 * Job Finder Worker
 * 
 * Standalone process that fetches jobs on a schedule.
 * 
 * Usage:
 *   pnpm worker          - Run continuously (hourly fetches)
 *   pnpm worker:once     - Run once and exit
 *   pnpm worker -- --once - Alternative for single run
 */

import { fetchAllActiveSearches } from '../src/lib/job-service'
import { prisma } from '../src/lib/db'

const FETCH_INTERVAL_MS = 60 * 60 * 1000 // 1 hour

async function runFetch(): Promise<void> {
  console.log('\n' + '='.repeat(60))
  console.log(`[${new Date().toISOString()}] Starting job fetch...`)
  console.log('='.repeat(60))

  try {
    const results = await fetchAllActiveSearches()

    // Summarize results
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)
    const totalJobsFound = results.reduce((sum, r) => sum + r.jobsFound, 0)
    const totalNewJobs = results.reduce((sum, r) => sum + r.jobsNew, 0)

    console.log('\nFetch Summary:')
    console.log(`  Total fetches: ${results.length}`)
    console.log(`  Successful: ${successful.length}`)
    console.log(`  Failed: ${failed.length}`)
    console.log(`  Jobs found: ${totalJobsFound}`)
    console.log(`  New jobs: ${totalNewJobs}`)

    if (failed.length > 0) {
      console.log('\nFailed fetches:')
      failed.forEach(f => {
        console.log(`  - ${f.provider}: ${f.error}`)
      })
    }

    // Log detailed results
    if (successful.length > 0) {
      console.log('\nSuccessful fetches:')
      successful.forEach(s => {
        console.log(`  - ${s.provider}: ${s.jobsFound} found, ${s.jobsNew} new (${s.durationMs}ms)`)
      })
    }
  } catch (error) {
    console.error('\nFetch error:', error)
  }
}

async function main(): Promise<void> {
  console.log('Job Finder Worker')
  console.log('================')
  console.log('')

  // Check for --once flag
  const runOnce = process.argv.includes('--once')

  if (runOnce) {
    console.log('Running single fetch...')
    await runFetch()
    console.log('\nDone!')
    await prisma.$disconnect()
    process.exit(0)
  }

  console.log(`Starting continuous mode (fetch interval: ${FETCH_INTERVAL_MS / 1000}s)`)
  console.log('Press Ctrl+C to stop')

  // Initial fetch
  await runFetch()

  // Schedule subsequent fetches
  const interval = setInterval(async () => {
    await runFetch()
  }, FETCH_INTERVAL_MS)

  // Handle graceful shutdown
  const shutdown = async () => {
    console.log('\n\nShutting down worker...')
    clearInterval(interval)
    await prisma.$disconnect()
    console.log('Goodbye!')
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

// Alternative: HTTP mode for serverless deployments
async function httpHandler(): Promise<void> {
  const apiKey = process.env.ADMIN_API_KEY
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (!apiKey) {
    console.error('ADMIN_API_KEY is required for HTTP mode')
    process.exit(1)
  }

  console.log(`Calling ${baseUrl}/api/admin/fetch...`)

  try {
    const response = await fetch(`${baseUrl}/api/admin/fetch`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Response:', JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('HTTP fetch failed:', error)
    process.exit(1)
  }
}

// Check if running in HTTP mode
if (process.argv.includes('--http')) {
  httpHandler().then(() => process.exit(0))
} else {
  main().catch(console.error)
}

