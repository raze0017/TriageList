import { NextFunction, Request, Response } from "express";
import { createApplication, getApplicationById, getApplicationFilePathById } from "./applications.service";
import { validateCreateApplicationInput } from "./applications.validation";
import { AppError } from "../../errors/app-error";
import fs from "fs";
import { getQueue } from "../../lib/queue";

export const uploadApplicationHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError(422, "VALIDATION_ERROR", "Resume PDF file is required.");
    }

    const input = validateCreateApplicationInput(req.body);
    const application = await createApplication(input, req.file);

    // Enqueue extraction job if status is pending
    if (application.status === "pending") {
      const queue = getQueue();
      await queue.send("extract-signals", { 
        applicationId: application.id,
        jdId: input.jdId
      });
    }

    res.status(201).json({
      data: {
        id: application.id,
        status: application.status,
      },
      requestId: req.requestId,
    });
  } catch (error) {
    // Clean up the uploaded temp file before forwarding the error so that
    // repeated failed submissions don't exhaust disk space.
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

export const getApplicationHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const application = await getApplicationById(id as string);

    if (!application) {
      throw new AppError(404, "NOT_FOUND", "Application not found.");
    }

    res.status(200).json({
      data: application,
      requestId: req.requestId,
    });
  } catch (error) {
    next(error);
  }
};

export const downloadApplicationFileHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const application = await getApplicationFilePathById(id as string);

    if (!application || !fs.existsSync(application.filePath)) {
      throw new AppError(404, "NOT_FOUND", "File not found.");
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");
    fs.createReadStream(application.filePath).pipe(res);
  } catch (error) {
    next(error);
  }
};
