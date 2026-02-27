/*
  Warnings:

  - You are about to drop the column `jd_id` on the `applications` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "JobApplicationStatus" AS ENUM ('pending', 'scoring', 'scored', 'failed');

-- CreateEnum
CREATE TYPE "JdStatus" AS ENUM ('draft', 'active', 'closed');

-- DropForeignKey
ALTER TABLE "applications" DROP CONSTRAINT "applications_jd_id_fkey";

-- DropIndex
DROP INDEX "applications_jd_id_idx";

-- DropIndex
DROP INDEX "candidate_signals_jd_match_score_idx";

-- AlterTable
ALTER TABLE "applications" DROP COLUMN "jd_id";

-- AlterTable
ALTER TABLE "jd_versions" ADD COLUMN     "created_by" TEXT NOT NULL DEFAULT 'system',
ADD COLUMN     "requirements" TEXT,
ADD COLUMN     "status" "JdStatus" NOT NULL DEFAULT 'draft',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "job_applications" (
    "id" UUID NOT NULL,
    "jd_id" UUID NOT NULL,
    "application_id" UUID NOT NULL,
    "status" "JobApplicationStatus" NOT NULL DEFAULT 'pending',
    "match_score" INTEGER,
    "reasoning" TEXT[],
    "attribute_scores" JSONB,
    "scored_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "job_applications_jd_id_idx" ON "job_applications"("jd_id");

-- CreateIndex
CREATE INDEX "job_applications_status_idx" ON "job_applications"("status");

-- CreateIndex
CREATE INDEX "job_applications_match_score_idx" ON "job_applications"("match_score");

-- CreateIndex
CREATE UNIQUE INDEX "job_applications_jd_id_application_id_key" ON "job_applications"("jd_id", "application_id");

-- CreateIndex
CREATE INDEX "applications_email_idx" ON "applications"("email");

-- CreateIndex
CREATE INDEX "jd_versions_status_idx" ON "jd_versions"("status");

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_jd_id_fkey" FOREIGN KEY ("jd_id") REFERENCES "jd_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
