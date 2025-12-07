-- Enrich contest data and add structured test requirements

-- Create new enum for standardized tests
CREATE TYPE "TestType" AS ENUM ('gmat', 'tage_mage', 'gre', 'toeic', 'toefl', 'ielts', 'sat', 'other');

-- Extend Contest with richer metadata
ALTER TABLE "Contest"
  ADD COLUMN "registrationUrl" TEXT,
  ADD COLUMN "languages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "examLocations" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "durationMinutes" INTEGER,
  ADD COLUMN "scoreScale" TEXT,
  ADD COLUMN "maxAttempts" INTEGER;

-- Structured requirements per test (GMAT, TAGE MAGE, TOEIC, TOEFL, etc.)
CREATE TABLE "ContestTestRequirement" (
  "id" TEXT NOT NULL,
  "test" "TestType" NOT NULL,
  "minimumScore" DOUBLE PRECISION,
  "recommendedScore" DOUBLE PRECISION,
  "weightPercent" INTEGER,
  "validityMonths" INTEGER,
  "sections" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "notes" TEXT,
  "registrationUrl" TEXT,
  "contestId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContestTestRequirement_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ContestTestRequirement_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ContestTestRequirement_contestId_test_idx" ON "ContestTestRequirement"("contestId", "test");

