-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Seniority" AS ENUM ('INTERN', 'JUNIOR', 'MID', 'SENIOR');
CREATE TYPE "WorkMode" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE');
CREATE TYPE "ApplicationStatus" AS ENUM ('DISCOVERED', 'MATCHED', 'REVIEW_REQUIRED', 'READY', 'APPLIED', 'INTERVIEW', 'REJECTED', 'OFFER');

-- CreateTable
CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Profile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "headline" TEXT,
  "bio" TEXT,
  "targetRoles" TEXT[],
  "skills" TEXT[],
  "seniority" "Seniority" NOT NULL,
  "workModes" "WorkMode"[],
  "locations" TEXT[],
  "minimumSalary" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Resume" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "storageKey" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Job" (
  "id" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "externalId" TEXT NOT NULL,
  "canonicalUrl" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "company" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "workMode" "WorkMode" NOT NULL,
  "seniority" "Seniority" NOT NULL,
  "salaryMin" INTEGER,
  "salaryMax" INTEGER,
  "requiredSkills" TEXT[],
  "optionalSkills" TEXT[],
  "requiresHumanReview" BOOLEAN NOT NULL DEFAULT true,
  "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Application" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "resumeId" TEXT,
  "status" "ApplicationStatus" NOT NULL DEFAULT 'DISCOVERED',
  "matchScore" INTEGER NOT NULL,
  "matchStrengths" TEXT[],
  "matchGaps" TEXT[],
  "appliedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
CREATE UNIQUE INDEX "Job_source_externalId_key" ON "Job"("source", "externalId");
CREATE UNIQUE INDEX "Job_canonicalUrl_key" ON "Job"("canonicalUrl");
CREATE INDEX "Application_userId_status_idx" ON "Application"("userId", "status");
CREATE UNIQUE INDEX "Application_userId_jobId_key" ON "Application"("userId", "jobId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
