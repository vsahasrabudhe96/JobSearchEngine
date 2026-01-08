import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  keywords: z.string().min(1).max(500).optional(),
  location: z.string().max(100).optional().nullable(),
  remote: z.boolean().optional(),
  providers: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
})

interface RouteContext { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const search = await prisma.search.findUnique({ where: { id }, include: { _count: { select: { jobs: true } } } })
  if (!search) return NextResponse.json({ error: 'Search not found' }, { status: 404 })
  return NextResponse.json({ search })
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const validated = updateSchema.parse(body)
    const updateData: any = {}
    if (validated.name !== undefined) updateData.name = validated.name
    if (validated.keywords !== undefined) updateData.keywords = validated.keywords
    if (validated.location !== undefined) updateData.location = validated.location
    if (validated.remote !== undefined) updateData.remote = validated.remote
    if (validated.providers !== undefined) updateData.providers = JSON.stringify(validated.providers)
    if (validated.isActive !== undefined) updateData.isActive = validated.isActive
    const search = await prisma.search.update({ where: { id }, data: updateData })
    return NextResponse.json({ search })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update search' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  await prisma.search.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
