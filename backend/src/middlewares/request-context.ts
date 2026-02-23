import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";

export const requestContext = (req: Request, res: Response, next: NextFunction) => {
  const requestId = (req.header("X-Request-Id") || randomUUID()).trim();
  const startedAt = Date.now();

  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  res.on("finish", () => {
    logger.info("request.completed", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });

  next();
};
