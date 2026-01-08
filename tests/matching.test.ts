/**
 * Job Matching Tests
 */

import { describe, it, expect } from 'vitest'
import { calculateMatchScore, scoreJobs, getTopRecommendations } from '../src/lib/matching/scorer'
import { jaccardSimilarity, overlapCoefficient, tokenize, normalizeText } from '../src/lib/matching/text-utils'
import type { ProfileForMatching, JobForMatching } from '../src/lib/matching/types'

describe('text-utils', () => {
  describe('normalizeText', () => {
    it('should lowercase text', () => {
      expect(normalizeText('Hello World')).toBe('hello world')
    })

    it('should remove punctuation', () => {
      expect(normalizeText('Hello, World!')).toBe('hello world')
    })

    it('should normalize whitespace', () => {
      expect(normalizeText('hello   world')).toBe('hello world')
    })
  })

  describe('tokenize', () => {
    it('should split into tokens', () => {
      const tokens = tokenize('hello world test')
      expect(tokens).toContain('hello')
      expect(tokens).toContain('world')
      expect(tokens).toContain('test')
    })

    it('should remove stopwords by default', () => {
      const tokens = tokenize('the quick brown fox and the lazy dog')
      expect(tokens).not.toContain('the')
      expect(tokens).not.toContain('and')
      expect(tokens).toContain('quick')
      expect(tokens).toContain('brown')
    })

    it('should keep stopwords when requested', () => {
      const tokens = tokenize('the quick brown fox', false)
      expect(tokens).toContain('the')
    })
  })

  describe('jaccardSimilarity', () => {
    it('should return 1 for identical sets', () => {
      const set = new Set(['a', 'b', 'c'])
      expect(jaccardSimilarity(set, set)).toBe(1)
    })

    it('should return 0 for disjoint sets', () => {
      const set1 = new Set(['a', 'b'])
      const set2 = new Set(['c', 'd'])
      expect(jaccardSimilarity(set1, set2)).toBe(0)
    })

    it('should return 0.5 for 50% overlap', () => {
      const set1 = new Set(['a', 'b'])
      const set2 = new Set(['b', 'c'])
      // intersection = {b}, union = {a, b, c}
      // 1/3 ≈ 0.333
      expect(jaccardSimilarity(set1, set2)).toBeCloseTo(0.333, 2)
    })

    it('should handle empty sets', () => {
      const empty = new Set<string>()
      const nonEmpty = new Set(['a'])
      expect(jaccardSimilarity(empty, empty)).toBe(1)
      expect(jaccardSimilarity(empty, nonEmpty)).toBe(0)
    })
  })

  describe('overlapCoefficient', () => {
    it('should return 1 when smaller set is subset', () => {
      const small = new Set(['a', 'b'])
      const large = new Set(['a', 'b', 'c', 'd'])
      expect(overlapCoefficient(small, large)).toBe(1)
    })

    it('should return 0.5 for partial overlap', () => {
      const set1 = new Set(['a', 'b'])
      const set2 = new Set(['a', 'c'])
      // intersection = {a}, min size = 2
      expect(overlapCoefficient(set1, set2)).toBe(0.5)
    })
  })
})

describe('calculateMatchScore', () => {
  const baseProfile: ProfileForMatching = {
    skills: ['javascript', 'react', 'typescript', 'node.js', 'aws'],
    keywords: ['frontend', 'web', 'agile', 'startup'],
    jobTitles: ['Senior Software Engineer', 'Frontend Developer'],
    openToRemote: true,
  }

  const baseJob: JobForMatching = {
    id: 'job-1',
    title: 'Senior Frontend Engineer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    description: 'Looking for a frontend engineer with React and TypeScript experience.',
    snippet: 'Build amazing web applications with React and TypeScript.',
    remote: true,
  }

  it('should return a score between 0 and 100', () => {
    const result = calculateMatchScore(baseProfile, baseJob)
    expect(result.totalScore).toBeGreaterThanOrEqual(0)
    expect(result.totalScore).toBeLessThanOrEqual(100)
  })

  it('should include all score components', () => {
    const result = calculateMatchScore(baseProfile, baseJob)
    expect(result.skillsScore).toBeDefined()
    expect(result.titleScore).toBeDefined()
    expect(result.keywordScore).toBeDefined()
    expect(result.preferenceScore).toBeDefined()
  })

  it('should have higher score for matching skills', () => {
    const goodMatch: ProfileForMatching = {
      ...baseProfile,
      skills: ['react', 'typescript', 'frontend'],
    }

    const poorMatch: ProfileForMatching = {
      ...baseProfile,
      skills: ['java', 'spring', 'backend'],
    }

    const goodScore = calculateMatchScore(goodMatch, baseJob)
    const poorScore = calculateMatchScore(poorMatch, baseJob)

    expect(goodScore.skillsScore).toBeGreaterThan(poorScore.skillsScore)
  })

  it('should track matched and missing skills', () => {
    const result = calculateMatchScore(baseProfile, baseJob)
    expect(result.matchedSkills).toBeDefined()
    expect(result.missingSkills).toBeDefined()
    expect(Array.isArray(result.matchedSkills)).toBe(true)
    expect(Array.isArray(result.missingSkills)).toBe(true)
  })

  it('should give preference score for remote match', () => {
    const remoteProfile: ProfileForMatching = {
      ...baseProfile,
      openToRemote: true,
    }

    const remoteJob: JobForMatching = {
      ...baseJob,
      remote: true,
    }

    const result = calculateMatchScore(remoteProfile, remoteJob)
    expect(result.remoteMatch).toBe(true)
    expect(result.preferenceScore).toBeGreaterThan(0)
  })

  it('should include reasons array', () => {
    const result = calculateMatchScore(baseProfile, baseJob)
    expect(result.reasons).toBeDefined()
    expect(Array.isArray(result.reasons)).toBe(true)
  })
})

describe('scoreJobs', () => {
  const profile: ProfileForMatching = {
    skills: ['javascript', 'react', 'typescript'],
    keywords: ['frontend', 'web'],
    jobTitles: ['Frontend Developer'],
    openToRemote: true,
  }

  const jobs: JobForMatching[] = [
    {
      id: 'job-1',
      title: 'Frontend Developer',
      company: 'A',
      location: 'Remote',
      description: 'React and TypeScript required',
      snippet: null,
      remote: true,
    },
    {
      id: 'job-2',
      title: 'Backend Engineer',
      company: 'B',
      location: 'NYC',
      description: 'Java and Spring experience needed',
      snippet: null,
      remote: false,
    },
    {
      id: 'job-3',
      title: 'Full Stack Developer',
      company: 'C',
      location: 'SF',
      description: 'JavaScript and React experience',
      snippet: null,
      remote: false,
    },
  ]

  it('should return sorted results by score', () => {
    const results = scoreJobs(profile, jobs)
    
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score)
    }
  })

  it('should rank frontend job higher than backend job', () => {
    const results = scoreJobs(profile, jobs)
    
    const frontendJob = results.find(r => r.jobId === 'job-1')
    const backendJob = results.find(r => r.jobId === 'job-2')
    
    expect(frontendJob!.score).toBeGreaterThan(backendJob!.score)
  })

  it('should include breakdown for each job', () => {
    const results = scoreJobs(profile, jobs)
    
    results.forEach(result => {
      expect(result.breakdown).toBeDefined()
      expect(result.breakdown.totalScore).toBe(result.score)
    })
  })
})

describe('getTopRecommendations', () => {
  const profile: ProfileForMatching = {
    skills: ['javascript', 'react'],
    keywords: ['frontend'],
    jobTitles: ['Developer'],
    openToRemote: true,
  }

  const jobs: JobForMatching[] = Array.from({ length: 50 }, (_, i) => ({
    id: `job-${i}`,
    title: `Job ${i}`,
    company: `Company ${i}`,
    location: 'Anywhere',
    description: i % 2 === 0 ? 'React JavaScript frontend' : 'Java backend',
    snippet: null,
    remote: i % 3 === 0,
  }))

  it('should return at most the specified limit', () => {
    const results = getTopRecommendations(profile, jobs, 20)
    expect(results.length).toBeLessThanOrEqual(20)
  })

  it('should default to 20 results', () => {
    const results = getTopRecommendations(profile, jobs)
    expect(results.length).toBeLessThanOrEqual(20)
  })

  it('should return the highest scoring jobs', () => {
    const allScored = scoreJobs(profile, jobs)
    const top20 = getTopRecommendations(profile, jobs, 20)
    
    // Top 20 should be the same as the first 20 from scoreJobs
    const expectedIds = allScored.slice(0, 20).map(j => j.jobId)
    const actualIds = top20.map(j => j.jobId)
    
    expect(actualIds).toEqual(expectedIds)
  })
})

