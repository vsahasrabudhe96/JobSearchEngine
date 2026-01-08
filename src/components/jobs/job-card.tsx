'use client'

import { Card, Badge, ScoreRing } from '@/components/ui'
import { formatRelativeTime } from '@/lib/utils'
import { MapPin, Building2, Clock, ExternalLink, Wifi, DollarSign, Stamp } from 'lucide-react'
import type { MatchBreakdown } from '@/lib/matching'

interface Job {
  id: string; title: string; company: string; location: string | null; snippet: string | null
  remote: boolean; jobType: string | null; salaryMin: number | null; salaryMax: number | null
  salaryCurrency: string | null; applyUrl: string; postedAt: string | Date; visaSponsorship: string
}

interface JobCardProps { job: Job; score?: number; breakdown?: MatchBreakdown; showMatchDetails?: boolean }

export function JobCard({ job, score, breakdown, showMatchDetails = false }: JobCardProps) {
  const visaBadge = () => {
    if (job.visaSponsorship === 'yes') return <Badge variant="success" className="gap-1"><Stamp className="w-3 h-3" />Visa Sponsorship</Badge>
    if (job.visaSponsorship === 'no') return <Badge variant="error" className="gap-1"><Stamp className="w-3 h-3" />No Sponsorship</Badge>
    return <Badge variant="neutral" className="gap-1"><Stamp className="w-3 h-3" />Visa Sponsorship Info not provided</Badge>
  }

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null
    const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: job.salaryCurrency || 'USD', maximumFractionDigits: 0 })
    if (job.salaryMin && job.salaryMax) return `${fmt.format(job.salaryMin)} - ${fmt.format(job.salaryMax)}`
    return job.salaryMin ? `From ${fmt.format(job.salaryMin)}` : `Up to ${fmt.format(job.salaryMax!)}`
  }

  return (
    <Card hover className="group" onClick={() => window.open(job.applyUrl, '_blank')}>
      <div className="flex gap-4">
        {score !== undefined && <div className="flex-shrink-0"><ScoreRing score={score} size="lg" /></div>}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-surface-900 group-hover:text-brand-600 transition-colors line-clamp-1">{job.title}</h3>
              <div className="flex items-center gap-2 mt-1 text-surface-600"><Building2 className="w-4 h-4" /><span className="font-medium">{job.company}</span></div>
            </div>
            <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex-shrink-0 p-2 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100"><ExternalLink className="w-4 h-4" /></a>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-surface-500">
            {job.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>}
            {job.remote && <span className="flex items-center gap-1 text-accent-600"><Wifi className="w-4 h-4" />Remote</span>}
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{formatRelativeTime(job.postedAt)}</span>
            {formatSalary() && <span className="flex items-center gap-1 text-emerald-600 font-medium"><DollarSign className="w-4 h-4" />{formatSalary()}</span>}
          </div>
          {job.snippet && <p className="mt-3 text-sm text-surface-600 line-clamp-2">{job.snippet}</p>}
          <div className="flex flex-wrap items-center gap-2 mt-4">{visaBadge()}{job.jobType && <Badge variant="info">{job.jobType}</Badge>}</div>
          {showMatchDetails && breakdown && (
            <div className="mt-4 pt-4 border-t border-surface-100 text-xs">
              <div className="flex flex-wrap gap-3"><span className="text-surface-500">Skills: <span className="font-medium text-surface-700">{breakdown.skillsScore}/50</span></span><span className="text-surface-500">Title: <span className="font-medium text-surface-700">{breakdown.titleScore}/20</span></span></div>
              {breakdown.matchedSkills.length > 0 && <div className="mt-2"><span className="text-surface-500">Matched: </span><span className="text-emerald-600 font-medium">{breakdown.matchedSkills.slice(0, 5).join(', ')}</span></div>}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
