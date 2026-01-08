import type { MatchBreakdown, ScoredJob, JobForMatching, ProfileForMatching } from './types'
import { tokenizeTitle, normalizeText, overlapCoefficient, findIntersection, findDifference, extractKeywords } from './text-utils'
import { extractAllSkills, normalizeSkill } from '../resume/skills'

const WEIGHTS = { skills: 50, title: 20, keywords: 20, preference: 10 }

export function calculateMatchScore(profile: ProfileForMatching, job: JobForMatching): MatchBreakdown {
  const reasons: string[] = []

  const resumeSkills = profile.skills.map(s => normalizeSkill(s))
  const resumeSkillsSet = new Set(resumeSkills)
  
  const jobText = [job.title, job.description || '', job.snippet || ''].join(' ')
  const jobSkills = extractAllSkills(jobText).map(s => normalizeSkill(s))
  const jobSkillsSet = new Set(jobSkills)

  const matchedSkills = findIntersection(resumeSkills, jobSkills)
  const missingSkills = findDifference(jobSkills, resumeSkills)
  const skillsOverlap = jobSkillsSet.size > 0 ? matchedSkills.length / jobSkillsSet.size : 0
  const skillsScore = Math.round(skillsOverlap * WEIGHTS.skills)

  if (matchedSkills.length > 0) reasons.push(`Matched ${matchedSkills.length} of ${jobSkillsSet.size} required skills`)

  const jobTitleTokens = tokenizeTitle(job.title)
  const jobTitleSet = new Set(jobTitleTokens)
  const resumeTitleTokens = profile.jobTitles.flatMap(t => tokenizeTitle(t))
  const resumeTitleSet = new Set(resumeTitleTokens)
  const titleTokensMatched = findIntersection(jobTitleTokens, resumeTitleTokens)
  const titleOverlap = jobTitleSet.size > 0 ? overlapCoefficient(resumeTitleSet, jobTitleSet) : 0
  const titleScore = Math.round(titleOverlap * WEIGHTS.title)

  if (titleTokensMatched.length > 0) reasons.push(`Title match: ${titleTokensMatched.join(', ')}`)

  const resumeKeywords = new Set(profile.keywords.map(k => k.toLowerCase()))
  const jobKeywords = new Set(extractKeywords(jobText))
  const matchedKeywords = findIntersection(Array.from(resumeKeywords), Array.from(jobKeywords))
  const keywordOverlap = jobKeywords.size > 0 ? overlapCoefficient(resumeKeywords, jobKeywords) : 0
  const keywordScore = Math.round(keywordOverlap * WEIGHTS.keywords)

  let preferenceScore = 0
  let locationMatch = false
  let remoteMatch = false

  if (profile.openToRemote && job.remote) {
    preferenceScore += 5
    remoteMatch = true
    reasons.push('Remote work available')
  } else if (job.remote) {
    preferenceScore += 3
    remoteMatch = true
  }
  if (preferenceScore === 0) preferenceScore = 5

  const totalScore = skillsScore + titleScore + keywordScore + preferenceScore

  return {
    skillsScore, matchedSkills, missingSkills: missingSkills.slice(0, 10), resumeSkills,
    titleScore, titleTokensMatched, jobTitleTokens,
    keywordScore, matchedKeywords: matchedKeywords.slice(0, 10),
    preferenceScore, locationMatch, remoteMatch, totalScore, reasons,
  }
}

export function scoreJobs(profile: ProfileForMatching, jobs: JobForMatching[]): ScoredJob[] {
  const scored = jobs.map(job => {
    const breakdown = calculateMatchScore(profile, job)
    return { jobId: job.id, score: breakdown.totalScore, breakdown }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored
}

export function getTopRecommendations(profile: ProfileForMatching, jobs: JobForMatching[], limit = 20): ScoredJob[] {
  return scoreJobs(profile, jobs).slice(0, limit)
}
