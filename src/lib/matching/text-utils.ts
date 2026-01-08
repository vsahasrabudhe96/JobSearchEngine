export const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
  'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
  'it', 'its', 'this', 'that', 'these', 'those', 'what', 'which', 'who',
  'we', 'you', 'he', 'she', 'they', 'i', 'me', 'him', 'her', 'us', 'them',
  'if', 'then', 'else', 'when', 'where', 'why', 'how', 'all', 'each', 'every',
])

const TITLE_STOPWORDS = new Set([
  'senior', 'junior', 'jr', 'sr', 'lead', 'principal', 'staff', 'associate',
  'entry', 'level', 'mid', 'intern', 'remote', 'hybrid', 'onsite',
])

export function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

export function tokenize(text: string, removeStopwords = true): string[] {
  const normalized = normalizeText(text)
  const tokens = normalized.split(' ').filter(t => t.length > 1)
  return removeStopwords ? tokens.filter(t => !STOPWORDS.has(t)) : tokens
}

export function tokenizeTitle(title: string): string[] {
  return tokenize(title, true).filter(t => !TITLE_STOPWORDS.has(t))
}

export function jaccardSimilarity(set1: Set<string>, set2: Set<string>): number {
  if (set1.size === 0 && set2.size === 0) return 1
  if (set1.size === 0 || set2.size === 0) return 0
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])
  return intersection.size / union.size
}

export function overlapCoefficient(set1: Set<string>, set2: Set<string>): number {
  if (set1.size === 0 || set2.size === 0) return 0
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  return intersection.size / Math.min(set1.size, set2.size)
}

export function findIntersection(arr1: string[], arr2: string[]): string[] {
  const set2 = new Set(arr2.map(s => s.toLowerCase()))
  return arr1.filter(s => set2.has(s.toLowerCase()))
}

export function findDifference(arr1: string[], arr2: string[]): string[] {
  const set2 = new Set(arr2.map(s => s.toLowerCase()))
  return arr1.filter(s => !set2.has(s.toLowerCase()))
}

export function extractKeywords(text: string): string[] {
  const tokens = tokenize(text, true)
  const counts = new Map<string, number>()
  for (const token of tokens) {
    if (token.length >= 3) counts.set(token, (counts.get(token) || 0) + 1)
  }
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([word]) => word)
}
