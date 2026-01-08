'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, Button, Spinner, Badge } from '@/components/ui'
import { FileText, ArrowLeft, Mail, Phone, MapPin, Briefcase, GraduationCap, Sparkles } from 'lucide-react'
import { formatFileSize, formatDate } from '@/lib/utils'
import type { ResumeProfile } from '@/lib/resume'

interface ResumeData { id: string; filename: string; fileType: string; fileSize: number; parseStatus: string; parseError: string | null; rawText: string | null; profile: ResumeProfile; createdAt: string }

export default function ResumeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [resume, setResume] = useState<ResumeData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResume = async () => {
      setLoading(true)
      const res = await fetch(`/api/resumes/${params.id}`)
      if (res.ok) { const data = await res.json(); setResume(data.resume) }
      setLoading(false)
    }
    if (params.id) fetchResume()
  }, [params.id])

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
  if (!resume) return <div className="space-y-6"><Button variant="ghost" onClick={() => router.back()} icon={<ArrowLeft className="w-4 h-4" />}>Back</Button><Card className="py-12 text-center"><h2 className="text-xl font-semibold">Resume not found</h2><Link href="/resumes" className="mt-4 inline-block"><Button>View All</Button></Link></Card></div>

  const { profile } = resume

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()} icon={<ArrowLeft className="w-4 h-4" />}>Back</Button>

      <Card>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center"><FileText className="w-8 h-8 text-brand-600" /></div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap"><h1 className="text-2xl font-bold">{profile.name || resume.filename}</h1><Badge variant={resume.parseStatus === 'success' ? 'success' : resume.parseStatus === 'partial' ? 'warning' : 'error'}>{resume.parseStatus}</Badge></div>
            <div className="flex items-center gap-4 mt-3 text-sm text-surface-500"><span>{formatFileSize(resume.fileSize)}</span><span>•</span><span>{resume.fileType.toUpperCase()}</span><span>•</span><span>Uploaded {formatDate(resume.createdAt)}</span></div>
          </div>
          <Link href={`/recommendations?resumeId=${resume.id}`}><Button icon={<Sparkles className="w-4 h-4" />}>Get Recommendations</Button></Link>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <h3 className="section-title">Contact</h3>
            <div className="space-y-3">
              {profile.email && <div className="flex items-center gap-3 text-surface-600"><Mail className="w-5 h-5 text-surface-400" /><a href={`mailto:${profile.email}`} className="hover:text-brand-600">{profile.email}</a></div>}
              {profile.phone && <div className="flex items-center gap-3 text-surface-600"><Phone className="w-5 h-5 text-surface-400" />{profile.phone}</div>}
              {profile.location && <div className="flex items-center gap-3 text-surface-600"><MapPin className="w-5 h-5 text-surface-400" />{profile.location}</div>}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="section-title flex items-center gap-2"><Sparkles className="w-5 h-5 text-accent-500" />Skills ({profile.skills.length})</h3>
            {profile.skills.length > 0 ? <div className="flex flex-wrap gap-2">{profile.skills.map((skill, i) => <Badge key={i} variant="info">{skill}</Badge>)}</div> : <p className="text-surface-500 italic">No skills extracted</p>}
          </Card>

          <Card>
            <h3 className="section-title flex items-center gap-2"><Briefcase className="w-5 h-5 text-brand-500" />Experience {profile.totalYearsExperience && <Badge variant="neutral">{profile.totalYearsExperience} years</Badge>}</h3>
            {profile.experience.length > 0 ? <div className="space-y-4">{profile.experience.map((exp, i) => <div key={i} className="border-l-2 border-surface-200 pl-4"><h4 className="font-semibold">{exp.title}</h4>{exp.company && <p className="text-surface-600">{exp.company}</p>}{(exp.startDate || exp.endDate) && <p className="text-sm text-surface-500 mt-1">{exp.startDate} {exp.endDate ? `- ${exp.endDate}` : ''}</p>}</div>)}</div> : <p className="text-surface-500 italic">No experience extracted</p>}
          </Card>

          <Card>
            <h3 className="section-title flex items-center gap-2"><GraduationCap className="w-5 h-5 text-emerald-500" />Education</h3>
            {profile.education.length > 0 ? <div className="space-y-3">{profile.education.map((edu, i) => <div key={i} className="border-l-2 border-surface-200 pl-4"><h4 className="font-semibold">{edu.degree} {edu.field && `in ${edu.field}`}</h4>{edu.institution && <p className="text-surface-600">{edu.institution}</p>}{edu.graduationDate && <p className="text-sm text-surface-500">{edu.graduationDate}</p>}</div>)}</div> : <p className="text-surface-500 italic">No education extracted</p>}
          </Card>
        </div>
      </div>
    </div>
  )
}
