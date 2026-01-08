import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseResume, getFileTypeFromExtension } from '@/lib/resume'

const MAX_FILE_SIZE = parseInt(process.env.MAX_UPLOAD_MB || '10', 10) * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` }, { status: 400 })

    const fileType = getFileTypeFromExtension(file.name)
    if (!fileType) return NextResponse.json({ error: 'Unsupported file type. Please upload a PDF or DOCX file.' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const parseResult = await parseResume(buffer, fileType)

    const parseStatus = parseResult.success ? (parseResult.warnings?.length ? 'partial' : 'success') : 'failed'

    const resume = await prisma.resume.create({
      data: { filename: file.name, fileType, fileSize: file.size, parseStatus, parseError: parseResult.error, rawText: parseResult.rawText || null, profileJson: JSON.stringify(parseResult.profile) }
    })

    return NextResponse.json({ resume: { id: resume.id, filename: resume.filename, fileType: resume.fileType, fileSize: resume.fileSize, parseStatus: resume.parseStatus, parseError: resume.parseError, profile: parseResult.profile, warnings: parseResult.warnings } }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload and parse resume' }, { status: 500 })
  }
}
