-- CreateEnum
CREATE TYPE "ProgramType" AS ENUM ('bachelor', 'master', 'msc', 'mba', 'emba', 'specialized_msc', 'executive_master', 'certificate', 'phd', 'other');

-- CreateEnum
CREATE TYPE "ProgramFormat" AS ENUM ('full_time', 'part_time', 'online', 'hybrid');

-- DropIndex
DROP INDEX "contestId_schoolId_title";

-- AlterTable
ALTER TABLE "Candidature" ADD COLUMN     "programId" TEXT;

-- AlterTable
ALTER TABLE "Contest" ADD COLUMN     "contacts" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'EUR',
ADD COLUMN     "description" TEXT,
ADD COLUMN     "examFormat" TEXT,
ADD COLUMN     "feesCents" INTEGER;

-- AlterTable
ALTER TABLE "Deadline" ADD COLUMN     "programId" TEXT;

-- AlterTable
ALTER TABLE "School" ADD COLUMN     "campuses" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "city" TEXT,
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'EUR',
ADD COLUMN     "description" TEXT,
ADD COLUMN     "tuitionCents" INTEGER,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ProgramType" NOT NULL,
    "domain" TEXT NOT NULL,
    "description" TEXT,
    "objectives" TEXT,
    "outcomes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "durationMonths" INTEGER,
    "ects" INTEGER,
    "format" "ProgramFormat" NOT NULL,
    "campuses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "startPeriods" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tuitionCents" INTEGER,
    "applicationFeeCents" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "financing" TEXT,
    "admissionPrerequisites" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "admissionTests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "admissionDocuments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "admissionProcess" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "website" TEXT,
    "schoolId" TEXT NOT NULL,
    "contestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramCourse" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "programId" TEXT NOT NULL,

    CONSTRAINT "ProgramCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramCareer" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "programId" TEXT NOT NULL,

    CONSTRAINT "ProgramCareer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ranking" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "category" TEXT,
    "year" INTEGER NOT NULL,
    "rank" INTEGER,
    "score" DOUBLE PRECISION,
    "url" TEXT,
    "programId" TEXT,
    "schoolId" TEXT,

    CONSTRAINT "Ranking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Program_slug_key" ON "Program"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "program_name_school" ON "Program"("name", "schoolId");

-- CreateIndex
CREATE INDEX "Ranking_source_year_idx" ON "Ranking"("source", "year");

-- CreateIndex
CREATE UNIQUE INDEX "contestId_schoolId_programId_title" ON "Deadline"("contestId", "schoolId", "programId", "title");

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramCourse" ADD CONSTRAINT "ProgramCourse_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramCareer" ADD CONSTRAINT "ProgramCareer_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deadline" ADD CONSTRAINT "Deadline_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidature" ADD CONSTRAINT "Candidature_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
