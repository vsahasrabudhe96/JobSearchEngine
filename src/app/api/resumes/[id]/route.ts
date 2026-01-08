import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { ResumeProfile } from '@/lib/resume'

interface RouteContext { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const resume = await prisma.resume.findUnique({ where: { id } })
  if (!resume) return NextResponse.json({ error: 'Resume not found' }, { status: 404 })

  let profile: ResumeProfile
  try { profile = JSON.parse(resume.profileJson) } catch { profile = { skills: [], experience: [], education: [], keywords: [], jobTitles: [] } }

  return NextResponse.json({ resume: { id: resume.id, filename: resume.filename, fileType: resume.fileType, fileSize: resume.fileSize, parseStatus: resume.parseStatus, parseError: resume.parseError, rawText: resume.rawText, profile, createdAt: resume.createdAt, updatedAt: resume.updatedAt } })
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  await prisma.resume.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
