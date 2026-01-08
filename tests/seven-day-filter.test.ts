/**
 * 7-Day Filter Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getSevenDaysAgo } from '../src/lib/utils'

describe('getSevenDaysAgo', () => {
  beforeEach(() => {
    // Mock the current date
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return a date 7 days ago', () => {
    // Set a fixed date: January 15, 2024 12:30:00 UTC
    vi.setSystemTime(new Date('2024-01-15T12:30:00Z'))
    
    const result = getSevenDaysAgo()
    
    // Should be January 8, 2024 at 00:00:00 UTC
    expect(result.getUTCFullYear()).toBe(2024)
    expect(result.getUTCMonth()).toBe(0) // January
    expect(result.getUTCDate()).toBe(8)
    expect(result.getUTCHours()).toBe(0)
    expect(result.getUTCMinutes()).toBe(0)
    expect(result.getUTCSeconds()).toBe(0)
  })

  it('should handle month boundaries', () => {
    // Set date to January 5, 2024 - 7 days ago should be December 29, 2023
    vi.setSystemTime(new Date('2024-01-05T15:00:00Z'))
    
    const result = getSevenDaysAgo()
    
    expect(result.getUTCFullYear()).toBe(2023)
    expect(result.getUTCMonth()).toBe(11) // December
    expect(result.getUTCDate()).toBe(29)
  })

  it('should handle year boundaries', () => {
    // Set date to January 3, 2024 - 7 days ago should be December 27, 2023
    vi.setSystemTime(new Date('2024-01-03T10:00:00Z'))
    
    const result = getSevenDaysAgo()
    
    expect(result.getUTCFullYear()).toBe(2023)
    expect(result.getUTCMonth()).toBe(11) // December
    expect(result.getUTCDate()).toBe(27)
  })

  it('should handle leap year', () => {
    // Set date to March 5, 2024 (leap year) - 7 days ago should be February 27
    vi.setSystemTime(new Date('2024-03-05T08:00:00Z'))
    
    const result = getSevenDaysAgo()
    
    expect(result.getUTCFullYear()).toBe(2024)
    expect(result.getUTCMonth()).toBe(1) // February
    expect(result.getUTCDate()).toBe(27)
  })

  it('should always set time to midnight UTC', () => {
    // Even if current time is 23:59:59, result should be 00:00:00
    vi.setSystemTime(new Date('2024-06-15T23:59:59Z'))
    
    const result = getSevenDaysAgo()
    
    expect(result.getUTCHours()).toBe(0)
    expect(result.getUTCMinutes()).toBe(0)
    expect(result.getUTCSeconds()).toBe(0)
    expect(result.getUTCMilliseconds()).toBe(0)
  })
})

describe('Job filtering logic', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should include jobs from exactly 7 days ago', () => {
    const sevenDaysAgo = getSevenDaysAgo()
    const jobPostedAt = new Date('2024-01-08T00:00:00Z')
    
    expect(jobPostedAt >= sevenDaysAgo).toBe(true)
  })

  it('should include jobs from 1 day ago', () => {
    const sevenDaysAgo = getSevenDaysAgo()
    const jobPostedAt = new Date('2024-01-14T15:00:00Z')
    
    expect(jobPostedAt >= sevenDaysAgo).toBe(true)
  })

  it('should include jobs from today', () => {
    const sevenDaysAgo = getSevenDaysAgo()
    const jobPostedAt = new Date('2024-01-15T10:00:00Z')
    
    expect(jobPostedAt >= sevenDaysAgo).toBe(true)
  })

  it('should exclude jobs from 8 days ago', () => {
    const sevenDaysAgo = getSevenDaysAgo()
    const jobPostedAt = new Date('2024-01-07T12:00:00Z')
    
    expect(jobPostedAt >= sevenDaysAgo).toBe(false)
  })

  it('should exclude jobs from 30 days ago', () => {
    const sevenDaysAgo = getSevenDaysAgo()
    const jobPostedAt = new Date('2023-12-16T12:00:00Z')
    
    expect(jobPostedAt >= sevenDaysAgo).toBe(false)
  })

  it('should handle edge case at midnight boundary', () => {
    const sevenDaysAgo = getSevenDaysAgo()
    
    // Job posted at exactly midnight 7 days ago should be included
    const includedJob = new Date('2024-01-08T00:00:00.000Z')
    expect(includedJob >= sevenDaysAgo).toBe(true)
    
    // Job posted 1 millisecond before midnight 7 days ago should be excluded
    const excludedJob = new Date('2024-01-07T23:59:59.999Z')
    expect(excludedJob >= sevenDaysAgo).toBe(false)
  })
})

