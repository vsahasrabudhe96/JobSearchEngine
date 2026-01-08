'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { JobCard } from '@/components/jobs/job-card'
import { Card, Button, Spinner, EmptyState } from '@/components/ui'
import { Sparkles, FileText, Search, RefreshCw, Info } from 'lucide-react'
import type { MatchBreakdown } from '@/lib/matching'

interface Resume { id: string; filename: string; parseStatus: string }
interface SearchItem { id: string; name: string }
interface Job { id: string; title: string; company: string; location: string | null; snippet: string | null; remote: boolean; jobType: string | null; salaryMin: number | null; salaryMax: number | null; salaryCurrency: string | null; applyUrl: string; postedAt: string; visaSponsorship: string }
interface Recommendation { job: Job; score: number; breakdown: MatchBreakdown }

export default function RecommendationsPage() {
  const searchParams = useSearchParams()
  const initialResumeId = searchParams.get('resumeId')

  const [resumes, setResumes] = useState<Resume[]>([])
  const [searches, setSearches] = useState<SearchItem[]>([])
  const [selectedResumeId, setSelectedResumeId] = useState<string>(initialResumeId || '')
  const [selectedSearchId, setSelectedSearchId] = useState<string>('')
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [totalJobs, setTotalJobs] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true)
      const [resumesRes, searchesRes] = await Promise.all([fetch('/api/resumes'), fetch('/api/searches')])
      const [resumesData, searchesData] = await Promise.all([resumesRes.json(), searchesRes.json()])
      setResumes(resumesData.resumes)
      setSearches(searchesData.searches)
      if (!selectedResumeId && resumesData.resumes.length > 0) setSelectedResumeId(resumesData.resumes[0].id)
      setLoadingData(false)
    }
    fetchData()
  }, [])

  const fetchRecommendations = async () => {
    if (!selectedResumeId) return
    setLoading(true)
    let url = `/api/recommendations?resumeId=${selectedResumeId}&limit=20`
    if (selectedSearchId) url += `&searchId=${selectedSearchId}`
    const res = await fetch(url)
    const data = await res.json()
    setRecommendations(data.recommendations)
    setTotalJobs(data.totalJobs)
    setLoading(false)
  }

  useEffect(() => { if (selectedResumeId) fetchRecommendations() }, [selectedResumeId, selectedSearchId])

  if (loadingData) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg"><Sparkles className="w-5 h-5 text-white" /></div>Job Recommendations</h1>
        <p className="page-subtitle">AI-powered job matches based on your resume</p>
      </div>

      <Card>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Select Resume</label>
            <div className="relative"><FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <select value={selectedResumeId} onChange={(e) => setSelectedResumeId(e.target.value)} className="input pl-10">
                <option value="">Choose a resume...</option>
                {resumes.map(r => <option key={r.id} value={r.id}>{r.filename}{r.parseStatus !== 'success' && ' (partial)'}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Filter by Search (Optional)</label>
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <select value={selectedSearchId} onChange={(e) => setSelectedSearchId(e.target.value)} className="input pl-10">
                <option value="">All jobs (last 7 days)</option>
                {searches.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
        </div>
        {selectedResumeId && <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-100"><div className="text-sm text-surface-500">{loading ? 'Finding matches...' : `Top ${recommendations.length} matches from ${totalJobs} jobs`}</div><Button size="sm" variant="secondary" onClick={fetchRecommendations} icon={<RefreshCw className="w-4 h-4" />} disabled={loading}>Refresh</Button></div>}
      </Card>

      {!selectedResumeId && resumes.length > 0 && (
        <Card className="bg-purple-50 border-purple-200">
          <div className="flex gap-4"><Info className="w-6 h-6 text-purple-600 flex-shrink-0" /><div><h3 className="font-semibold text-purple-900">How Recommendations Work</h3><p className="text-purple-700 mt-1">Select a resume above. We score jobs 0-100 based on:</p><ul className="mt-2 space-y-1 text-purple-700 text-sm"><li>• Skills Match (50%)</li><li>• Title Similarity (20%)</li><li>• Keywords (20%)</li><li>• Preferences (10%)</li></ul></div></div>
        </Card>
      )}

      {resumes.length === 0 && <Card><EmptyState icon={<FileText className="w-12 h-12" />} title="No resumes uploaded" description="Upload a resume first" action={<a href="/resumes"><Button>Upload Resume</Button></a>} /></Card>}

      {loading && <div className="flex items-center justify-center py-16"><Spinner size="lg" /><p className="ml-4 text-surface-500">Finding matches...</p></div>}

      {!loading && selectedResumeId && recommendations.length === 0 && <Card><EmptyState icon={<Sparkles className="w-12 h-12" />} title="No matching jobs found" description="No jobs from the last 7 days match your profile." /></Card>}

      {!loading && recommendations.length > 0 && <div className="space-y-4">{recommendations.map((rec, i) => <div key={rec.job.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}><JobCard job={rec.job} score={rec.score} breakdown={rec.breakdown} showMatchDetails={true} /></div>)}</div>}
    </div>
  )
}
