-- AlterTable
ALTER TABLE "Deadline" ADD COLUMN     "sessionLabel" TEXT NOT NULL DEFAULT 'Session unique';

ALTER TABLE "Candidature" ADD COLUMN     "sessionLabel" TEXT NOT NULL DEFAULT 'Session unique';

