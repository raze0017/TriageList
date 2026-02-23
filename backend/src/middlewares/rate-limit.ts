import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";

type Bucket = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 120;
const buckets = new Map<string, Bucket>();

// Periodic cleanup
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (now > bucket.resetAt) {
      buckets.delete(key);
    }
  }
}, WINDOW_MS);

export const rateLimit = (req: Request, _res: Response, next: NextFunction) => {
  const key = req.ip || "unknown";
  const now = Date.now();
  const bucket = buckets.get(key);

  // No bucket or expired → create fresh
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  // Limit exceeded
  if (bucket.count >= MAX_REQUESTS) {
    return next(
      new AppError(
        429,
        "RATE_LIMITED",
        "Too many requests. Please retry later.",
      ),
    );
  }

  bucket.count += 1;
  next();
};
