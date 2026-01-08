export interface ResumeProfile {
  name?: string
  email?: string
  phone?: string
  location?: string
  linkedIn?: string
  github?: string
  website?: string
  summary?: string
  headline?: string
  skills: string[]
  experience: ExperienceEntry[]
  totalYearsExperience?: number
  education: EducationEntry[]
  keywords: string[]
  jobTitles: string[]
  preferredLocation?: string
  openToRemote?: boolean
}

export interface ExperienceEntry {
  title?: string
  company?: string
  location?: string
  startDate?: string
  endDate?: string
  current?: boolean
  description?: string
  highlights?: string[]
}

export interface EducationEntry {
  institution?: string
  degree?: string
  field?: string
  graduationDate?: string
  gpa?: string
}

export interface ResumeParseResult {
  success: boolean
  profile: ResumeProfile
  rawText: string
  warnings?: string[]
  error?: string
}

export type SupportedFileType = 'pdf' | 'docx'

export function isSupportedFileType(type: string): type is SupportedFileType {
  return type === 'pdf' || type === 'docx'
}

export function getFileTypeFromMime(mimeType: string): SupportedFileType | null {
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx'
  return null
}

export function getFileTypeFromExtension(filename: string): SupportedFileType | null {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (ext === 'docx') return 'docx'
  return null
}
