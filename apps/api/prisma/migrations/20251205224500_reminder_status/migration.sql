-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('pending', 'sent', 'error');

-- AlterTable
ALTER TABLE "Reminder"
  ADD COLUMN "status" "ReminderStatus" NOT NULL DEFAULT 'pending',
  ADD COLUMN "sentAt" TIMESTAMP(3),
  ADD COLUMN "lastError" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Reminder_userId_deadlineId_channel_sendAt_key"
  ON "Reminder"("userId", "deadlineId", "channel", "sendAt");

