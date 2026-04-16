import { prisma } from "../../lib/prisma";
import { CreateApplicationInput } from "./applications.validation";
import fs from "fs";
import path from "path";
import { env } from "../../config/env";
import pdf from "pdf-parse";
import { AppError } from "../../errors/app-error";
import { randomUUID } from "crypto";

export const createApplication = async (
  input: CreateApplicationInput,
  file: any // Using 'any' since @types/multer might not be recognized yet
) => {
  // 1. Verify JD exists
  const jd = await prisma.jdVersion.findUnique({
    where: { id: input.jdId },
  });

  if (!jd) {
    // Cleanup the uploaded file if JD doesn't exist
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw new AppError(404, "NOT_FOUND", "The specified Job Description does not exist.");
  }

  const applicationId = randomUUID();
  const finalPath = path.join(env.UPLOAD_DIR, `${applicationId}.pdf`);

  let rawText = "";
  let status: "pending" | "unprocessable" = "pending";

  try {
    // 2. Extract text from PDF
    const dataBuffer = fs.readFileSync(file.path);
    const pdfData = await pdf(dataBuffer);
    rawText = pdfData.text;

    // 3. Move file to final location
    fs.renameSync(file.path, finalPath);
  } catch (error) {
    status = "unprocessable";
    // If it fails, we still keep the application record but mark it unprocessable
    // and we might want to still move the file for debugging
    if (fs.existsSync(file.path)) {
      fs.renameSync(file.path, finalPath);
    }
  }

  // 4. Create database record
  const application = await prisma.$transaction(async (tx: any) => {
    const app = await tx.application.create({
      data: {
        id: applicationId,
        applicantName: input.applicantName,
        email: input.email,
        filePath: finalPath,
        rawText: { content: rawText }, // Store as JSONB
        status: status,
      },
    });

    // Link to JD
    await tx.jobApplication.create({
      data: {
        jdId: input.jdId,
        applicationId: app.id,
      },
    });

    return app;
  });

  return application;
};

export const getApplicationById = async (id: string) => {
  return prisma.application.findUnique({
    where: { id },
    select: {
      id: true,
      applicantName: true,
      email: true,
      status: true,
      submittedAt: true,
      candidateSignal: true,
    },
  });
};

/** Internal query used only by the file download handler — includes filePath */
export const getApplicationFilePathById = async (id: string) => {
  return prisma.application.findUnique({
    where: { id },
    select: { id: true, filePath: true },
  });
};
