-- CreateTable
CREATE TABLE "Search" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "location" TEXT,
    "remote" BOOLEAN NOT NULL DEFAULT false,
    "providers" TEXT NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "externalId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "snippet" TEXT,
    "remote" BOOLEAN NOT NULL DEFAULT false,
    "jobType" TEXT,
    "salaryMin" REAL,
    "salaryMax" REAL,
    "salaryCurrency" TEXT,
    "applyUrl" TEXT NOT NULL,
    "postedAt" DATETIME NOT NULL,
    "visaSponsorship" TEXT NOT NULL DEFAULT 'unknown',
    "dedupHash" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SearchJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "searchId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "foundAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SearchJob_searchId_fkey" FOREIGN KEY ("searchId") REFERENCES "Search" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SearchJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FetchLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "searchId" TEXT,
    "provider" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "jobsFound" INTEGER NOT NULL DEFAULT 0,
    "jobsNew" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "durationMs" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "filename" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "parseStatus" TEXT NOT NULL DEFAULT 'pending',
    "parseError" TEXT,
    "rawText" TEXT,
    "profileJson" TEXT NOT NULL DEFAULT '{}'
);

-- CreateTable
CREATE TABLE "JobRecommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resumeId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "breakdownJson" TEXT NOT NULL DEFAULT '{}',
    CONSTRAINT "JobRecommendation_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "JobRecommendation_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Search_isActive_idx" ON "Search"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Job_dedupHash_key" ON "Job"("dedupHash");

-- CreateIndex
CREATE INDEX "Job_source_idx" ON "Job"("source");

-- CreateIndex
CREATE INDEX "Job_postedAt_idx" ON "Job"("postedAt");

-- CreateIndex
CREATE INDEX "Job_visaSponsorship_idx" ON "Job"("visaSponsorship");

-- CreateIndex
CREATE INDEX "Job_dedupHash_idx" ON "Job"("dedupHash");

-- CreateIndex
CREATE INDEX "SearchJob_searchId_idx" ON "SearchJob"("searchId");

-- CreateIndex
CREATE INDEX "SearchJob_jobId_idx" ON "SearchJob"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "SearchJob_searchId_jobId_key" ON "SearchJob"("searchId", "jobId");

-- CreateIndex
CREATE INDEX "FetchLog_createdAt_idx" ON "FetchLog"("createdAt");

-- CreateIndex
CREATE INDEX "FetchLog_provider_idx" ON "FetchLog"("provider");

-- CreateIndex
CREATE INDEX "FetchLog_searchId_idx" ON "FetchLog"("searchId");

-- CreateIndex
CREATE INDEX "Resume_parseStatus_idx" ON "Resume"("parseStatus");

-- CreateIndex
CREATE INDEX "JobRecommendation_resumeId_score_idx" ON "JobRecommendation"("resumeId", "score");

-- CreateIndex
CREATE INDEX "JobRecommendation_jobId_idx" ON "JobRecommendation"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "JobRecommendation_resumeId_jobId_key" ON "JobRecommendation"("resumeId", "jobId");

