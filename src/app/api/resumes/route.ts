import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const resumes = await prisma.resume.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, filename: true, fileType: true, fileSize: true, parseStatus: true, parseError: true, createdAt: true, updatedAt: true } })
    return NextResponse.json({ resumes })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch resumes' }, { status: 500 })
  }
}
