/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('pending', 'processing', 'ready', 'unprocessable');

-- CreateEnum
CREATE TYPE "ExperienceBand" AS ENUM ('ZERO_TO_ONE', 'ONE_TO_THREE', 'THREE_TO_FIVE', 'FIVE_PLUS');

-- CreateEnum
CREATE TYPE "Level" AS ENUM ('low', 'medium', 'high');

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "jd_versions" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "raw_jd_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jd_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" UUID NOT NULL,
    "jd_id" UUID NOT NULL,
    "applicant_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "raw_text" JSONB NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'pending',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_signals" (
    "id" UUID NOT NULL,
    "application_id" UUID NOT NULL,
    "primary_skills" TEXT[],
    "experience_band" "ExperienceBand" NOT NULL,
    "domain_alignment" "Level" NOT NULL,
    "resume_completeness" "Level" NOT NULL,
    "ambiguity_flag" BOOLEAN NOT NULL DEFAULT false,
    "jd_match_score" "Level" NOT NULL,
    "extracted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_signals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "applications_jd_id_idx" ON "applications"("jd_id");

-- CreateIndex
CREATE INDEX "applications_status_idx" ON "applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_signals_application_id_key" ON "candidate_signals"("application_id");

-- CreateIndex
CREATE INDEX "candidate_signals_jd_match_score_idx" ON "candidate_signals"("jd_match_score");

-- CreateIndex
CREATE INDEX "candidate_signals_experience_band_idx" ON "candidate_signals"("experience_band");

-- CreateIndex
CREATE INDEX "candidate_signals_domain_alignment_idx" ON "candidate_signals"("domain_alignment");

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_jd_id_fkey" FOREIGN KEY ("jd_id") REFERENCES "jd_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_signals" ADD CONSTRAINT "candidate_signals_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
