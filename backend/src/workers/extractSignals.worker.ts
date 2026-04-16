import { Job } from "bullmq";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { logger } from "../config/logger";
import { ExperienceBand, Level } from "@prisma/client";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

interface ExtractSignalsPayload {
  applicationId: string;
  jdId: string;
}

const signalsSchema = z.object({
  primarySkills: z.array(z.string()).min(1, "Must extract at least one skill").describe("List of core technical and domain skills found in the resume."),
  experienceBand: z.enum([
    ExperienceBand.ZERO_TO_ONE,
    ExperienceBand.ONE_TO_THREE,
    ExperienceBand.THREE_TO_FIVE,
    ExperienceBand.FIVE_PLUS,
  ]).describe("The candidate's years of experience mapped to the strict enums."),
  domainAlignment: z.enum([Level.low, Level.medium, Level.high]).describe("How well the candidate's past industry/domain experience matches the job."),
  resumeCompleteness: z.enum([Level.low, Level.medium, Level.high]).describe("Completeness of the resume details (e.g., dates, descriptions)."),
  ambiguityFlag: z.boolean().describe("Set to true if the resume text is vague, contradictory, or hard for you to extract signals from."),
  jdMatchScore: z.enum([Level.low, Level.medium, Level.high]).describe("An overall assessment of how well the candidate matches the provided JD."),
});

const PROMPT_TEMPLATE = `
You are an expert HR recruitment assistant. Your job is to strictly extract exactly 6 candidate signals from a resume when compared to a specific job description (JD).

You MUST ONLY return a valid, raw JSON object matching the described schema. Do NOT include markdown blocks, natural language explanations, or any other text outside the JSON.

SCHEMA DEFINITION:
{
  "primarySkills": ["string", ...], // List of technical and domain skills
  "experienceBand": "ZERO_TO_ONE" | "ONE_TO_THREE" | "THREE_TO_FIVE" | "FIVE_PLUS",
  "domainAlignment": "low" | "medium" | "high",
  "resumeCompleteness": "low" | "medium" | "high",
  "ambiguityFlag": boolean, // true if the resume is unclear, missing critical info, or vague
  "jdMatchScore": "low" | "medium" | "high" // overall match with the JD requirements
}

---
JOB DESCRIPTION:
{{JD_TEXT}}

---
RESUME TEXT:
{{RESUME_TEXT}}
---

Analyze the resume against the job description and return the JSON object:
`;

export const extractSignalsWorker = async (job: Job<ExtractSignalsPayload>) => {
  const { applicationId, jdId } = job.data;
  
  logger.info(`[Worker] Starting extractSignals for Application: ${applicationId}`);

  try {
    // 1. Mark Application as processing
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: "processing" },
    });

    // 2. Fetch Application and JD Data
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    const jdVersion = await prisma.jdVersion.findUnique({
      where: { id: jdId },
    });

    if (!application || !jdVersion) {
      throw new Error(`Missing Application (${applicationId}) or JD (${jdId})`);
    }

    if (!application.rawText) {
       throw new Error("Application has no rawText");
    }

    // 3. Prepare the LLM Prompt
    const prompt = PROMPT_TEMPLATE
      .replace("{{JD_TEXT}}", jdVersion.rawJdText)
      .replace("{{RESUME_TEXT}}", JSON.stringify(application.rawText));

    // 4. Call Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const responseText = result.response.text();
    if (!responseText) {
      throw new Error("Empty response from LLM");
    }

    // 5. Parse and Validate LLM Output
    const rawJson = JSON.parse(responseText);
    const validatedSignals = signalsSchema.parse(rawJson);

    // 6. Write to Database
    await prisma.$transaction([
      prisma.candidateSignal.create({
        data: {
          applicationId: application.id,
          primarySkills: validatedSignals.primarySkills,
          experienceBand: validatedSignals.experienceBand,
          domainAlignment: validatedSignals.domainAlignment,
          resumeCompleteness: validatedSignals.resumeCompleteness,
          ambiguityFlag: validatedSignals.ambiguityFlag,
          jdMatchScore: validatedSignals.jdMatchScore,
        },
      }),
      prisma.application.update({
        where: { id: application.id },
        data: { status: "ready" },
      }),
    ]);

    logger.info(`[Worker] Successfully extracted signals for Application: ${applicationId}`);

  } catch (error: any) {
    logger.error(`[Worker] Failed extractSignals for Application: ${applicationId}`, { 
      errorName: error?.name,
      errorMessage: error?.message,
      errorStack: error?.stack,
      status: error?.status,
      statusText: error?.statusText
    });
    
    // Only mark as unprocessable if this is the final attempt
    const maxAttempts = job.opts?.attempts || 1;
    if (job.attemptsMade >= maxAttempts - 1) {
      await prisma.application.update({
        where: { id: applicationId },
        data: { status: "unprocessable" },
      }).catch(supressedErr => {
        logger.error("Failed to set application to unprocessable state", { supressedErr });
      });
    }

    throw error; // Let BullMQ know the job failed so it can trigger retry/failure mechanisms
  }
};
