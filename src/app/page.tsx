'use client'

import { useEffect, useState } from 'react'
import { JobCard } from '@/components/jobs/job-card'
import { Card, Button, Input, Spinner, EmptyState } from '@/components/ui'
import { Briefcase, Search, RefreshCw } from 'lucide-react'

interface Job { id: string; title: string; company: string; location: string | null; snippet: string | null; remote: boolean; jobType: string | null; salaryMin: number | null; salaryMax: number | null; salaryCurrency: string | null; applyUrl: string; postedAt: string; visaSponsorship: string }

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [total, setTotal] = useState(0)

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/jobs?limit=50')
      if (!response.ok) throw new Error('Failed to fetch jobs')
      const data = await response.json()
      setJobs(data.jobs)
      setTotal(data.total)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchJobs() }, [])

  const filteredJobs = jobs.filter(job => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return job.title.toLowerCase().includes(query) || job.company.toLowerCase().includes(query) || job.location?.toLowerCase().includes(query)
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg"><Briefcase className="w-5 h-5 text-white" /></div>
            Recent Jobs
          </h1>
          <p className="page-subtitle">{total > 0 ? `${total} jobs found in the last 7 days` : 'Loading jobs...'}</p>
        </div>
        <Button onClick={fetchJobs} variant="secondary" icon={<RefreshCw className="w-4 h-4" />} disabled={loading}>Refresh</Button>
      </div>

      <Card padding="md">
        <Input placeholder="Search jobs by title, company, or location..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} icon={<Search className="w-4 h-4" />} />
      </Card>

      {loading ? <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
        : error ? <Card><EmptyState icon={<Briefcase className="w-12 h-12" />} title="Error loading jobs" description={error} action={<Button onClick={fetchJobs}>Try Again</Button>} /></Card>
        : filteredJobs.length === 0 ? <Card><EmptyState icon={<Briefcase className="w-12 h-12" />} title={searchQuery ? 'No matching jobs' : 'No jobs yet'} description={searchQuery ? 'Try adjusting your search' : 'Create a search to start finding jobs.'} /></Card>
        : <div className="space-y-4">{filteredJobs.map((job, i) => <div key={job.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}><JobCard job={job} /></div>)}</div>
      }
    </div>
  )
}
