'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Card, Button, Spinner, EmptyState, Badge } from '@/components/ui'
import { FileText, Upload, Trash2, Eye, AlertTriangle } from 'lucide-react'
import { formatFileSize, formatRelativeTime } from '@/lib/utils'

interface Resume { id: string; filename: string; fileType: string; fileSize: number; parseStatus: string; parseError: string | null; createdAt: string }

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchResumes = async () => { setLoading(true); const res = await fetch('/api/resumes'); const data = await res.json(); setResumes(data.resumes); setLoading(false) }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) { setUploadError('Please upload a PDF or DOCX file'); return }
    if (file.size > 10 * 1024 * 1024) { setUploadError('File size must be less than 10MB'); return }

    setUploading(true); setUploadError(null)
    const formData = new FormData(); formData.append('file', file)
    const res = await fetch('/api/resumes/upload', { method: 'POST', body: formData })
    if (!res.ok) { const data = await res.json(); setUploadError(data.error || 'Upload failed') }
    else fetchResumes()
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const deleteResume = async (id: string) => { if (!confirm('Delete this resume?')) return; await fetch(`/api/resumes/${id}`, { method: 'DELETE' }); fetchResumes() }

  useEffect(() => { fetchResumes() }, [])

  const getStatusBadge = (status: string) => status === 'success' ? <Badge variant="success">Parsed</Badge> : status === 'partial' ? <Badge variant="warning">Partial</Badge> : status === 'failed' ? <Badge variant="error">Failed</Badge> : <Badge variant="neutral">Pending</Badge>

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg"><FileText className="w-5 h-5 text-white" /></div>Resumes</h1>
          <p className="page-subtitle">Upload your resume to get personalized job recommendations</p>
        </div>
        <div>
          <input ref={fileInputRef} type="file" accept=".pdf,.docx" onChange={handleUpload} className="hidden" id="resume-upload" />
          <Button onClick={() => fileInputRef.current?.click()} loading={uploading} icon={<Upload className="w-4 h-4" />}>Upload Resume</Button>
        </div>
      </div>

      {uploadError && <Card className="bg-red-50 border-red-200 animate-slide-down"><div className="flex items-center gap-3 text-red-700"><AlertTriangle className="w-5 h-5" /><p>{uploadError}</p><Button size="sm" variant="ghost" onClick={() => setUploadError(null)} className="ml-auto">Dismiss</Button></div></Card>}

      <Card className="bg-surface-50 border-dashed">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-200 flex items-center justify-center mb-4"><Upload className="w-8 h-8 text-surface-500" /></div>
          <h3 className="text-lg font-semibold mb-2">Upload your resume</h3>
          <p className="text-surface-500 max-w-md mb-4">We&apos;ll parse your resume to extract skills, experience, and keywords for matching.</p>
          <div className="flex items-center gap-4 text-sm text-surface-400"><span>PDF and DOCX</span><span>•</span><span>Max 10MB</span></div>
        </div>
      </Card>

      {loading ? <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
        : resumes.length === 0 ? <Card><EmptyState icon={<FileText className="w-12 h-12" />} title="No resumes uploaded" description="Upload your resume to get started" /></Card>
        : <div className="space-y-4">{resumes.map((resume, i) => (
          <Card key={resume.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center"><FileText className="w-6 h-6 text-brand-600" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><h3 className="font-semibold truncate">{resume.filename}</h3>{getStatusBadge(resume.parseStatus)}</div>
                <div className="flex items-center gap-3 mt-1 text-sm text-surface-500"><span>{formatFileSize(resume.fileSize)}</span><span>•</span><span>{resume.fileType.toUpperCase()}</span><span>•</span><span>{formatRelativeTime(resume.createdAt)}</span></div>
                {resume.parseError && <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><AlertTriangle className="w-4 h-4" />{resume.parseError}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/resumes/${resume.id}`}><Button size="sm" variant="secondary" icon={<Eye className="w-4 h-4" />}>View</Button></Link>
                <Button size="sm" variant="ghost" onClick={() => deleteResume(resume.id)} icon={<Trash2 className="w-4 h-4" />} className="text-red-600 hover:bg-red-50" />
              </div>
            </div>
          </Card>
        ))}</div>
      }
    </div>
  )
}
