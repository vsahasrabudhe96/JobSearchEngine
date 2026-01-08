import type { ResumeProfile, ExperienceEntry, EducationEntry, ResumeParseResult } from './types'
import { extractAllSkills } from './skills'

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
const PHONE_REGEX = /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g
const LINKEDIN_REGEX = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?/gi
const GITHUB_REGEX = /(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+\/?/gi

const SECTION_PATTERNS = {
  experience: /\b(experience|employment|work\s*history|professional\s*experience)\b/i,
  education: /\b(education|academic|degree|university|college)\b/i,
  skills: /\b(skills|technologies|technical\s*skills|competencies|expertise)\b/i,
  summary: /\b(summary|profile|objective|about\s*me|professional\s*summary)\b/i,
}

const JOB_TITLE_PATTERNS = [
  /\b(senior|sr\.?|junior|jr\.?|lead|principal|staff|chief|head\s+of)\s+/i,
  /\b(software|frontend|backend|full[\s-]?stack|mobile|web|devops|data|ml|machine\s+learning|ai|cloud|security|qa|test|product|project|program)\s+(engineer|developer|architect|manager|designer|analyst|scientist|specialist|consultant|lead)\b/i,
]

export function parseResumeText(text: string): ResumeParseResult {
  const warnings: string[] = []
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  
  const emails = text.match(EMAIL_REGEX) || []
  const phones = text.match(PHONE_REGEX) || []
  const linkedInUrls = text.match(LINKEDIN_REGEX) || []
  const githubUrls = text.match(GITHUB_REGEX) || []
  
  let name: string | undefined
  for (const line of lines.slice(0, 5)) {
    if (!EMAIL_REGEX.test(line) && !PHONE_REGEX.test(line) && !line.includes('http') && line.length < 50 && line.length > 2) {
      const lowerLine = line.toLowerCase()
      if (!lowerLine.includes('resume') && !lowerLine.includes('curriculum') && !lowerLine.includes('vitae')) {
        name = line
        break
      }
    }
  }

  const locationMatch = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),?\s*([A-Z]{2})\b/)
  const location = locationMatch ? `${locationMatch[1]}, ${locationMatch[2]}` : undefined

  const sections = splitIntoSections(text)
  const skills = extractAllSkills(text)
  if (skills.length === 0) warnings.push('No skills could be automatically extracted')

  const experience = extractExperience(sections.experience || text)
  const education = extractEducation(sections.education || text)
  const jobTitles = extractJobTitles(text)
  const totalYearsExperience = estimateYearsExperience(experience)
  const keywords = extractKeywords(text, skills)
  const openToRemote = /\b(remote|work\s+from\s+home|wfh|distributed)\b/i.test(text)

  const profile: ResumeProfile = {
    name, email: emails[0], phone: phones[0], location,
    linkedIn: linkedInUrls[0], github: githubUrls[0],
    summary: sections.summary?.slice(0, 500),
    skills, experience, totalYearsExperience, education, keywords, jobTitles, openToRemote,
  }

  const hasMinimalData = profile.name || profile.email || skills.length > 0 || experience.length > 0
  if (!hasMinimalData) warnings.push('Could not extract structured data from resume')

  return { success: hasMinimalData, profile, rawText: text, warnings: warnings.length > 0 ? warnings : undefined }
}

function splitIntoSections(text: string): Record<string, string> {
  const sections: Record<string, string> = {}
  const lines = text.split('\n')
  let currentSection = 'header'
  let currentContent: string[] = []

  for (const line of lines) {
    let foundSection = false
    for (const [sectionName, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(line) && line.length < 50) {
        if (currentContent.length > 0) sections[currentSection] = currentContent.join('\n')
        currentSection = sectionName
        currentContent = []
        foundSection = true
        break
      }
    }
    if (!foundSection) currentContent.push(line)
  }
  if (currentContent.length > 0) sections[currentSection] = currentContent.join('\n')
  return sections
}

function extractExperience(text: string): ExperienceEntry[] {
  const entries: ExperienceEntry[] = []
  const lines = text.split('\n')
  let currentEntry: Partial<ExperienceEntry> | null = null
  let descriptionLines: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const isTitleLine = JOB_TITLE_PATTERNS.some(p => p.test(trimmed))
    if (isTitleLine) {
      if (currentEntry?.title) {
        currentEntry.description = descriptionLines.join(' ').trim()
        entries.push(currentEntry as ExperienceEntry)
      }
      currentEntry = { title: trimmed.slice(0, 100), current: /present|current/i.test(trimmed) }
      descriptionLines = []
      const dateMatch = trimmed.match(/(\d{4})\s*[-–]\s*(\d{4}|present|current)/i)
      if (dateMatch) {
        currentEntry.startDate = dateMatch[1]
        currentEntry.endDate = dateMatch[2].toLowerCase() === 'present' ? 'Present' : dateMatch[2]
      }
    } else if (currentEntry && trimmed.length > 20) {
      descriptionLines.push(trimmed)
    }
  }

  if (currentEntry?.title) {
    currentEntry.description = descriptionLines.join(' ').trim()
    entries.push(currentEntry as ExperienceEntry)
  }
  return entries.slice(0, 10)
}

function extractEducation(text: string): EducationEntry[] {
  const entries: EducationEntry[] = []
  const degreePatterns = [
    /\b(Bachelor(?:'s)?|B\.?S\.?|B\.?A\.?)\b/gi,
    /\b(Master(?:'s)?|M\.?S\.?|M\.?A\.?|MBA)\b/gi,
    /\b(Ph\.?D\.?|Doctor(?:ate)?)\b/gi,
  ]

  const lines = text.split('\n')
  for (const line of lines) {
    for (const pattern of degreePatterns) {
      pattern.lastIndex = 0
      const match = pattern.exec(line)
      if (match) {
        const entry: EducationEntry = { degree: match[1] }
        const yearMatch = line.match(/\b(19|20)\d{2}\b/)
        if (yearMatch) entry.graduationDate = yearMatch[0]
        entries.push(entry)
        break
      }
    }
  }
  return entries.slice(0, 5)
}

function extractJobTitles(text: string): string[] {
  const titles: Set<string> = new Set()
  const lines = text.split('\n')
  for (const line of lines) {
    for (const pattern of JOB_TITLE_PATTERNS) {
      pattern.lastIndex = 0
      const match = pattern.exec(line.trim())
      if (match && match[0].length > 3 && match[0].length < 50) {
        titles.add(match[0].trim())
      }
    }
  }
  return Array.from(titles).slice(0, 10)
}

function estimateYearsExperience(experience: ExperienceEntry[]): number | undefined {
  if (experience.length === 0) return undefined
  let totalMonths = 0
  const currentYear = new Date().getFullYear()

  for (const entry of experience) {
    const startYear = entry.startDate ? parseInt(entry.startDate, 10) : null
    let endYear = entry.endDate && entry.endDate !== 'Present' ? parseInt(entry.endDate, 10) : currentYear
    if (startYear && !isNaN(startYear) && !isNaN(endYear)) {
      totalMonths += Math.max(0, (endYear - startYear) * 12)
    }
  }

  const years = Math.round(totalMonths / 12)
  return years > 0 && years < 50 ? years : undefined
}

function extractKeywords(text: string, skills: string[]): string[] {
  const keywords = new Set<string>()
  skills.forEach(skill => keywords.add(skill.toLowerCase()))
  
  const techKeywords = ['agile', 'scrum', 'ci/cd', 'devops', 'cloud', 'microservices', 'api', 'rest', 'graphql', 'testing', 'tdd']
  const textLower = text.toLowerCase()
  for (const keyword of techKeywords) {
    if (textLower.includes(keyword)) keywords.add(keyword)
  }
  return Array.from(keywords).slice(0, 50)
}
