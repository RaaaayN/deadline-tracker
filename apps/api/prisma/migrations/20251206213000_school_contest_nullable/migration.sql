-- Allow schools without a contest and set FK to SET NULL
ALTER TABLE "School" DROP CONSTRAINT "School_contestId_fkey";

ALTER TABLE "School" ALTER COLUMN "contestId" DROP NOT NULL;

ALTER TABLE "School"
  ADD CONSTRAINT "School_contestId_fkey"
  FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE SET NULL ON UPDATE CASCADE;


