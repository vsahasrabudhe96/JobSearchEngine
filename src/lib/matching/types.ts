export interface MatchBreakdown {
  skillsScore: number
  matchedSkills: string[]
  missingSkills: string[]
  resumeSkills: string[]
  titleScore: number
  titleTokensMatched: string[]
  jobTitleTokens: string[]
  keywordScore: number
  matchedKeywords: string[]
  preferenceScore: number
  locationMatch: boolean
  remoteMatch: boolean
  totalScore: number
  reasons: string[]
}

export interface ScoredJob {
  jobId: string
  score: number
  breakdown: MatchBreakdown
}

export interface JobForMatching {
  id: string
  title: string
  company: string
  location: string | null
  description: string | null
  snippet: string | null
  remote: boolean
}

export interface ProfileForMatching {
  skills: string[]
  keywords: string[]
  jobTitles: string[]
  preferredLocation?: string
  openToRemote?: boolean
}
