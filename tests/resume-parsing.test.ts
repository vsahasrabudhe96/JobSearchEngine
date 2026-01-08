/**
 * Resume Parsing Tests
 */

import { describe, it, expect } from 'vitest'
import { parseResumeText } from '../src/lib/resume/parser'
import { extractAllSkills, normalizeSkill } from '../src/lib/resume/skills'

describe('extractAllSkills', () => {
  it('should extract programming languages', () => {
    const text = 'Experienced in JavaScript, TypeScript, Python, and Java'
    const skills = extractAllSkills(text)
    expect(skills).toContain('javascript')
    expect(skills).toContain('typescript')
    expect(skills).toContain('python')
    expect(skills).toContain('java')
  })

  it('should extract frameworks and libraries', () => {
    const text = 'Built applications with React, Next.js, Node.js, and Express'
    const skills = extractAllSkills(text)
    expect(skills).toContain('react')
    expect(skills).toContain('next.js')
    expect(skills).toContain('node.js')
    expect(skills).toContain('express')
  })

  it('should extract databases', () => {
    const text = 'Experience with PostgreSQL, MongoDB, Redis, and DynamoDB'
    const skills = extractAllSkills(text)
    expect(skills).toContain('postgres')
    expect(skills).toContain('mongodb')
    expect(skills).toContain('redis')
    expect(skills).toContain('dynamodb')
  })

  it('should extract cloud and devops tools', () => {
    const text = 'Deployed on AWS using Docker, Kubernetes, and Terraform'
    const skills = extractAllSkills(text)
    expect(skills).toContain('aws')
    expect(skills).toContain('docker')
    expect(skills).toContain('kubernetes')
    expect(skills).toContain('terraform')
  })

  it('should extract soft skills', () => {
    const text = 'Strong leadership and communication skills. Experience with teamwork and project management.'
    const skills = extractAllSkills(text)
    expect(skills).toContain('leadership')
    expect(skills).toContain('communication')
    expect(skills).toContain('teamwork')
    expect(skills).toContain('project management')
  })

  it('should handle case insensitivity', () => {
    const text = 'REACT, JavaScript, PYTHON, aws'
    const skills = extractAllSkills(text)
    expect(skills).toContain('react')
    expect(skills).toContain('javascript')
    expect(skills).toContain('python')
    expect(skills).toContain('aws')
  })

  it('should return empty array for no skills', () => {
    const text = 'Hello world, this is a test.'
    const skills = extractAllSkills(text)
    expect(skills.length).toBe(0)
  })
})

describe('normalizeSkill', () => {
  it('should normalize skill aliases', () => {
    expect(normalizeSkill('reactjs')).toBe('react')
    expect(normalizeSkill('React.js')).toBe('react')
    expect(normalizeSkill('nodejs')).toBe('node.js')
    expect(normalizeSkill('golang')).toBe('go')
    expect(normalizeSkill('k8s')).toBe('kubernetes')
  })

  it('should lowercase skills', () => {
    expect(normalizeSkill('JavaScript')).toBe('javascript')
    expect(normalizeSkill('PYTHON')).toBe('python')
  })
})

describe('parseResumeText', () => {
  const sampleResume = `
John Doe
john.doe@email.com
(555) 123-4567
San Francisco, CA
linkedin.com/in/johndoe
github.com/johndoe

Summary
Senior software engineer with 8+ years of experience building scalable web applications.

Experience
Senior Software Engineer - TechCorp Inc
2020 - Present
• Led development of microservices architecture
• Implemented CI/CD pipelines with GitHub Actions
• Mentored junior developers

Software Engineer - StartupXYZ
2016 - 2020
• Built React frontend applications
• Developed Node.js backend services
• Worked with PostgreSQL and Redis

Education
Master of Science in Computer Science
University of California, Berkeley
2016

Skills
JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, Kubernetes, PostgreSQL
`

  it('should extract name', () => {
    const result = parseResumeText(sampleResume)
    expect(result.profile.name).toBe('John Doe')
  })

  it('should extract email', () => {
    const result = parseResumeText(sampleResume)
    expect(result.profile.email).toBe('john.doe@email.com')
  })

  it('should extract phone', () => {
    const result = parseResumeText(sampleResume)
    expect(result.profile.phone).toContain('555')
  })

  it('should extract location', () => {
    const result = parseResumeText(sampleResume)
    expect(result.profile.location).toBe('San Francisco, CA')
  })

  it('should extract skills', () => {
    const result = parseResumeText(sampleResume)
    expect(result.profile.skills.length).toBeGreaterThan(5)
    expect(result.profile.skills).toContain('javascript')
    expect(result.profile.skills).toContain('react')
    expect(result.profile.skills).toContain('aws')
  })

  it('should extract experience entries', () => {
    const result = parseResumeText(sampleResume)
    expect(result.profile.experience.length).toBeGreaterThan(0)
  })

  it('should extract education', () => {
    const result = parseResumeText(sampleResume)
    expect(result.profile.education.length).toBeGreaterThan(0)
    const edu = result.profile.education[0]
    expect(edu.degree).toContain('Master')
  })

  it('should return success for valid resume', () => {
    const result = parseResumeText(sampleResume)
    expect(result.success).toBe(true)
  })

  it('should handle empty text', () => {
    const result = parseResumeText('')
    expect(result.success).toBe(false)
    expect(result.profile.skills).toHaveLength(0)
  })

  it('should generate keywords', () => {
    const result = parseResumeText(sampleResume)
    expect(result.profile.keywords.length).toBeGreaterThan(0)
  })
})

