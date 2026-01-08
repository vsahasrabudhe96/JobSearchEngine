# JobFinder

An AI-powered job discovery application with resume matching. Find jobs that match your skills and get personalized recommendations.

![JobFinder](https://img.shields.io/badge/Next.js-14-black?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square)

## Features

- 🔍 **Saved Job Searches** - Create and manage multiple job searches with custom keywords and filters
- 📊 **7-Day Fresh Jobs** - Only shows jobs posted within the last 7 days (UTC)
- 🌐 **Provider Architecture** - Extensible system for adding new job sources
- 📝 **Resume Parsing** - Upload PDF/DOCX resumes and extract structured profile data
- 🎯 **Smart Matching** - AI-powered job-resume matching with detailed score breakdowns
- ✈️ **Visa Sponsorship Detection** - Automatically detects visa sponsorship status from job descriptions
- ⏰ **Hourly Updates** - Background worker fetches new jobs every hour

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes, TypeScript
- **Database**: SQLite (local), PostgreSQL (production)
- **ORM**: Prisma
- **Worker**: Standalone Node.js process or GitHub Actions

## Project Structure

```
job-finder/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── admin/         # Admin endpoints (fetch trigger)
│   │   │   ├── jobs/          # Job listing endpoints
│   │   │   ├── searches/      # Search CRUD endpoints
│   │   │   ├── resumes/       # Resume upload/management
│   │   │   ├── recommendations/ # Job matching
│   │   │   └── providers/     # Available providers
│   │   ├── jobs/              # Jobs listing page
│   │   ├── searches/          # Saved searches page
│   │   ├── resumes/           # Resume management
│   │   │   └── [id]/          # Resume detail view
│   │   └── recommendations/   # Job recommendations
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── layout/           # Layout components
│   │   └── jobs/             # Job-related components
│   └── lib/
│       ├── db.ts             # Prisma client
│       ├── utils.ts          # Utility functions
│       ├── job-service.ts    # Job fetching logic
│       ├── sources/          # Job source providers
│       │   ├── types.ts      # Type definitions
│       │   ├── base.ts       # Base provider class
│       │   ├── registry.ts   # Provider registry
│       │   ├── visa-heuristics.ts  # Visa detection
│       │   └── providers/    # Individual providers
│       ├── resume/           # Resume parsing
│       │   ├── types.ts
│       │   ├── extractors.ts # PDF/DOCX extraction
│       │   ├── parser.ts     # Text parsing
│       │   └── skills.ts     # Skills extraction
│       └── matching/         # Job matching
│           ├── types.ts
│           ├── text-utils.ts # Text processing
│           └── scorer.ts     # Scoring algorithm
├── worker/                    # Background worker
│   └── index.ts
├── prisma/
│   └── schema.prisma         # Database schema
├── tests/                     # Unit tests
└── .github/
    └── workflows/
        └── worker.yml        # GitHub Actions hourly job
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/job-finder.git
cd job-finder

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your settings

# Initialize the database
pnpm db:push

# Start the development server
pnpm dev
```

The app will be available at http://localhost:3000

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `file:./dev.db` |
| `ADMIN_API_KEY` | API key for admin endpoints | Required |
| `MAX_UPLOAD_MB` | Max resume upload size | `10` |
| `NEXT_PUBLIC_APP_URL` | Public app URL | `http://localhost:3000` |

## Running the Worker

The worker fetches new jobs from all active searches.

### Local Development

```bash
# Run continuously (hourly fetches)
pnpm worker

# Run once and exit
pnpm worker:once
```

### Production (GitHub Actions)

The included GitHub Actions workflow runs hourly. Set up these secrets in your repository:

- `ADMIN_API_KEY`: Your admin API key
- `APP_URL`: Your deployed app URL (e.g., `https://yourapp.vercel.app`)

## How Matching Works

JobFinder uses a deterministic scoring algorithm to match resumes with jobs. No external LLM APIs required!

### Scoring Components

| Component | Weight | Description |
|-----------|--------|-------------|
| Skills Match | 50% | Overlap between resume skills and job requirements |
| Title Similarity | 20% | How well your job titles match the position |
| Keywords | 20% | Industry terms and technology matches |
| Preferences | 10% | Remote/location preference alignment |

### Detailed Breakdown

Each recommendation includes:
- **Matched Skills**: Skills from your resume that match the job
- **Missing Skills**: Skills to develop for better matches
- **Matched Keywords**: Industry terms that align
- **Title Match**: How your experience titles relate

### Example

```
Resume: React, TypeScript, Node.js, AWS
Job: Senior Frontend Engineer - React/TypeScript

Score: 75/100
- Skills: 40/50 (matched: react, typescript, node.js)
- Title: 15/20 (strong match on "frontend", "engineer")
- Keywords: 12/20 (matched: frontend, web, agile)
- Preferences: 8/10 (remote available)
```

## Adding New Providers

Create a new provider in `src/lib/sources/providers/`:

```typescript
// src/lib/sources/providers/example-provider.ts
import { BaseJobSource } from '../base'
import type { JobSearchQuery, JobSourceResult } from '../types'

export class ExampleProvider extends BaseJobSource {
  readonly id = 'example'
  readonly name = 'Example Jobs'

  isAvailable(): boolean {
    // Check if provider is configured
    return !!process.env.EXAMPLE_API_KEY
  }

  async fetchJobs(query: JobSearchQuery): Promise<JobSourceResult> {
    // Fetch jobs from your source
    const response = await fetch('https://api.example.com/jobs', {
      headers: { 'Authorization': `Bearer ${process.env.EXAMPLE_API_KEY}` },
      body: JSON.stringify({ q: query.keywords }),
    })
    
    const data = await response.json()
    
    // Map to JobPosting format
    const jobs = data.jobs.map(job => ({
      externalId: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      applyUrl: job.url,
      postedAt: new Date(job.posted_date),
      // visaSponsorship will be inferred if not provided
    }))

    // processJobPostings adds visa heuristics
    return { jobs: this.processJobPostings(jobs) }
  }
}
```

Register in `src/lib/sources/registry.ts`:

```typescript
import { ExampleProvider } from './providers/example-provider'

// In constructor:
this.register(new ExampleProvider())
```

## Deployment

### Vercel (Recommended for Web App)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables:
   - `DATABASE_URL`: Neon/Supabase PostgreSQL connection string
   - `ADMIN_API_KEY`: Secure random string
4. Deploy

### Database (Neon or Supabase)

1. Create a PostgreSQL database
2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Run migrations: `pnpm db:migrate`

### Worker (GitHub Actions)

1. Set repository secrets:
   - `ADMIN_API_KEY`
   - `APP_URL`
2. The workflow in `.github/workflows/worker.yml` runs hourly

### AWS Alternative

#### ECS Task for Worker

1. Build Docker image:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY . .
   RUN npm install -g pnpm && pnpm install
   CMD ["pnpm", "worker:once"]
   ```

2. Create ECS scheduled task (every hour)

#### Next.js on AWS

- **App Runner**: Easiest option, auto-scaling
- **ECS + Fargate**: More control, container-based
- **Lambda + API Gateway**: For serverless

## API Reference

### Searches

- `GET /api/searches` - List all searches
- `POST /api/searches` - Create a search
- `GET /api/searches/:id` - Get a search
- `PATCH /api/searches/:id` - Update a search
- `DELETE /api/searches/:id` - Delete a search

### Jobs

- `GET /api/jobs` - List recent jobs (7 days)
- `GET /api/jobs/:id` - Get a job

### Resumes

- `POST /api/resumes/upload` - Upload a resume
- `GET /api/resumes` - List resumes
- `GET /api/resumes/:id` - Get resume with profile
- `DELETE /api/resumes/:id` - Delete a resume

### Recommendations

- `GET /api/recommendations?resumeId=...&searchId=...` - Get job matches

### Admin

- `POST /api/admin/fetch` - Trigger job fetching (requires API key)
- `GET /api/admin/fetch` - Get provider status

## Testing

```bash
# Run all tests
pnpm test

# Run tests once
pnpm test:run

# Run specific test file
pnpm test tests/matching.test.ts
```

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

