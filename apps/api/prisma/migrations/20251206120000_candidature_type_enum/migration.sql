-- CreateEnum
CREATE TYPE "CandidatureType" AS ENUM ('concours', 'diplome');

-- AlterTable
ALTER TABLE "Candidature"
ADD COLUMN     "type" "CandidatureType" NOT NULL DEFAULT 'concours';

