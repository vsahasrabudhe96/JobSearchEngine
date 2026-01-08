export * from './types'
export * from './extractors'
export * from './parser'
export * from './skills'

import { extractText } from './extractors'
import { parseResumeText } from './parser'
import type { SupportedFileType, ResumeParseResult } from './types'

export async function parseResume(buffer: Buffer, fileType: SupportedFileType): Promise<ResumeParseResult> {
  try {
    const rawText = await extractText(buffer, fileType)
    
    if (!rawText || rawText.trim().length === 0) {
      return {
        success: false,
        profile: { skills: [], experience: [], education: [], keywords: [], jobTitles: [] },
        rawText: '',
        error: 'No text could be extracted from the file',
      }
    }

    return parseResumeText(rawText)
  } catch (error) {
    return {
      success: false,
      profile: { skills: [], experience: [], education: [], keywords: [], jobTitles: [] },
      rawText: '',
      error: error instanceof Error ? error.message : 'Unknown parsing error',
    }
  }
}
