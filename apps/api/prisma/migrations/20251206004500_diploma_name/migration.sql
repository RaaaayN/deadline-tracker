-- Add optional diploma/program name to deadlines and candidatures
ALTER TABLE "Deadline" ADD COLUMN "diplomaName" TEXT;
ALTER TABLE "Candidature" ADD COLUMN "diplomaName" TEXT;


