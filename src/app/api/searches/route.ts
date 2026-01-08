import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const searchSchema = z.object({
  name: z.string().min(1).max(100),
  keywords: z.string().min(1).max(500),
  location: z.string().max(100).optional(),
  remote: z.boolean().optional().default(false),
  providers: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
})

export async function GET() {
  try {
    const searches = await prisma.search.findMany({ orderBy: { createdAt: 'desc' }, include: { _count: { select: { jobs: true } } } })
    return NextResponse.json({ searches })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch searches' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = searchSchema.parse(body)
    const search = await prisma.search.create({ data: { name: validated.name, keywords: validated.keywords, location: validated.location, remote: validated.remote, providers: JSON.stringify(validated.providers), isActive: validated.isActive } })
    return NextResponse.json({ search }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid request body', details: error.errors }, { status: 400 })
    return NextResponse.json({ error: 'Failed to create search' }, { status: 500 })
  }
}
