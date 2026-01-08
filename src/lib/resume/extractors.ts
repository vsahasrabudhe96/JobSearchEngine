import type { SupportedFileType } from './types'

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = await import('pdf-parse')
    const data = await pdfParse.default(buffer)
    return data.text
  } catch (error) {
    console.error('PDF extraction error:', error)
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  try {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  } catch (error) {
    console.error('DOCX extraction error:', error)
    throw new Error(`Failed to extract text from DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function extractText(buffer: Buffer, fileType: SupportedFileType): Promise<string> {
  switch (fileType) {
    case 'pdf':
      return extractTextFromPdf(buffer)
    case 'docx':
      return extractTextFromDocx(buffer)
    default:
      throw new Error(`Unsupported file type: ${fileType}`)
  }
}
