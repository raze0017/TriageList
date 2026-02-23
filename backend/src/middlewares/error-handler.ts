import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";
import { AppError } from "../errors/app-error";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const requestId = req.requestId;

  // 1️⃣ Known application errors
  if (error instanceof AppError) {
    logger.error("request.failed", {
      requestId,
      code: error.code,
      message: error.message,
    });

    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details ?? null,
      },
      requestId,
    });
  }

  // 2️⃣ Malformed JSON (body parser error)
  if (error?.type === "entity.parse.failed") {
    logger.warn("request.failed.bad_json", { requestId });

    return res.status(400).json({
      error: {
        code: "BAD_REQUEST",
        message: "Malformed JSON body.",
        details: null,
      },
      requestId,
    });
  }

  // 3️⃣ Fallback (real 500s)
  logger.error("request.failed.unhandled", {
    requestId,
    error,
  });

  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred.",
      details: null,
    },
    requestId,
  });
};
