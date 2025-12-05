-- CreateEnum
CREATE TYPE "Role" AS ENUM ('student', 'parent', 'mentor', 'campus_admin', 'super_admin');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('todo', 'doing', 'done');

-- CreateEnum
CREATE TYPE "ReminderChannel" AS ENUM ('email', 'sms', 'push');

-- CreateEnum
CREATE TYPE "DeadlineType" AS ENUM ('registration', 'test', 'oral', 'result', 'other');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('missing', 'pending', 'validated');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'student',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deadline" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "DeadlineType" NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "contestId" TEXT NOT NULL,
    "schoolId" TEXT,
    "createdByAdmin" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Deadline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidature" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "schoolId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL,
    "candidatureId" TEXT NOT NULL,
    "deadlineId" TEXT,
    "tips" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "deadlineId" TEXT NOT NULL,
    "channel" "ReminderChannel" NOT NULL,
    "sendAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'missing',
    "candidatureId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "name_year" ON "Contest"("name", "year");

-- CreateIndex
CREATE UNIQUE INDEX "name_contestId" ON "School"("name", "contestId");

-- CreateIndex
CREATE UNIQUE INDEX "contestId_schoolId_title" ON "Deadline"("contestId", "schoolId", "title");

-- AddForeignKey
ALTER TABLE "School" ADD CONSTRAINT "School_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deadline" ADD CONSTRAINT "Deadline_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deadline" ADD CONSTRAINT "Deadline_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidature" ADD CONSTRAINT "Candidature_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidature" ADD CONSTRAINT "Candidature_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidature" ADD CONSTRAINT "Candidature_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_candidatureId_fkey" FOREIGN KEY ("candidatureId") REFERENCES "Candidature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_deadlineId_fkey" FOREIGN KEY ("deadlineId") REFERENCES "Deadline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_deadlineId_fkey" FOREIGN KEY ("deadlineId") REFERENCES "Deadline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_candidatureId_fkey" FOREIGN KEY ("candidatureId") REFERENCES "Candidature"("id") ON DELETE CASCADE ON UPDATE CASCADE;
