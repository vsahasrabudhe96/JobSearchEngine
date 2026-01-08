import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface RouteContext { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const job = await prisma.job.findUnique({ where: { id } })
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  return NextResponse.json({ job })
}
