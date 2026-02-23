"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = void 0;
const app_error_1 = require("../errors/app-error");
const WINDOW_MS = 60000;
const MAX_REQUESTS = 120;
const buckets = new Map();
const rateLimit = (req, _res, next) => {
    const key = req.ip || "unknown";
    const now = Date.now();
    const existing = buckets.get(key);
    if (!existing || now > existing.resetAt) {
        buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
        next();
        return;
    }
    if (existing.count >= MAX_REQUESTS) {
        next(new app_error_1.AppError(429, "RATE_LIMITED", "Too many requests. Please retry later."));
        return;
    }
    existing.count += 1;
    next();
};
exports.rateLimit = rateLimit;
