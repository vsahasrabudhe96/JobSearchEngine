import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const checks: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? 'SET (hidden)' : 'NOT SET',
      ADMIN_API_KEY: process.env.ADMIN_API_KEY ? 'SET' : 'NOT SET',
    },
  }

  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    checks.database = 'connected'
  } catch (error) {
    checks.database = 'failed'
    checks.databaseError = error instanceof Error ? error.message : 'Unknown error'
  }

  const isHealthy = checks.database === 'connected'
  
  return NextResponse.json(checks, { status: isHealthy ? 200 : 500 })
}

