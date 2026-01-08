/**
 * Visa Sponsorship Heuristics Tests
 */

import { describe, it, expect } from 'vitest'
import { inferVisaSponsorship, inferVisaSponsorshipFromJob } from '../src/lib/sources/visa-heuristics'

describe('inferVisaSponsorship', () => {
  describe('should return "yes" for visa sponsorship available', () => {
    const yesPatterns = [
      'We offer visa sponsorship for qualified candidates',
      'H1B sponsorship available',
      'Will sponsor visa for the right candidate',
      'Sponsorship provided for this position',
      'We sponsor H-1B visas',
      'Immigration sponsorship available',
      'Open to sponsor qualified candidates',
      'Company provides sponsorship',
    ]

    yesPatterns.forEach(text => {
      it(`should match: "${text.slice(0, 50)}..."`, () => {
        expect(inferVisaSponsorship(text)).toBe('yes')
      })
    })
  })

  describe('should return "no" for no visa sponsorship', () => {
    const noPatterns = [
      'No visa sponsorship available',
      'Cannot sponsor visas at this time',
      'We will not sponsor for this position',
      'Must be authorized to work in the US',
      'US citizens only',
      'Green card required',
      'Unable to sponsor work visas',
      'No H1B sponsorship',
      'Sponsorship not available for this role',
      'Permanent resident only',
    ]

    noPatterns.forEach(text => {
      it(`should match: "${text.slice(0, 50)}..."`, () => {
        expect(inferVisaSponsorship(text)).toBe('no')
      })
    })
  })

  describe('should return "unknown" for ambiguous text', () => {
    const unknownPatterns = [
      'Great opportunity for engineers',
      'Join our team and build amazing products',
      'We are looking for talented developers',
      'Competitive salary and benefits',
      '',
      null,
      undefined,
    ]

    unknownPatterns.forEach(text => {
      it(`should return unknown for: "${String(text).slice(0, 30)}..."`, () => {
        expect(inferVisaSponsorship(text as string)).toBe('unknown')
      })
    })
  })

  it('should prioritize "no" patterns over "yes" patterns', () => {
    // If both patterns are present, "no" should take precedence
    const text = 'We cannot sponsor visas. Previously we did sponsor H1B.'
    expect(inferVisaSponsorship(text)).toBe('no')
  })
})

describe('inferVisaSponsorshipFromJob', () => {
  it('should combine title, description, and snippet for analysis', () => {
    const job = {
      title: 'Software Engineer',
      description: 'We offer visa sponsorship for qualified candidates.',
      snippet: 'Great opportunity',
    }
    expect(inferVisaSponsorshipFromJob(job)).toBe('yes')
  })

  it('should find patterns in description', () => {
    const job = {
      title: 'Senior Developer',
      description: 'Must be authorized to work in the US without sponsorship.',
      snippet: undefined,
    }
    expect(inferVisaSponsorshipFromJob(job)).toBe('no')
  })

  it('should find patterns in snippet', () => {
    const job = {
      title: 'Data Scientist',
      description: undefined,
      snippet: 'H1B sponsorship available for this role.',
    }
    expect(inferVisaSponsorshipFromJob(job)).toBe('yes')
  })

  it('should handle empty job', () => {
    const job = {
      title: undefined,
      description: undefined,
      snippet: undefined,
    }
    expect(inferVisaSponsorshipFromJob(job as any)).toBe('unknown')
  })
})

