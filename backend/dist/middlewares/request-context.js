"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestContext = void 0;
const crypto_1 = require("crypto");
const logger_1 = require("../config/logger");
const requestContext = (req, res, next) => {
    const requestId = (req.header("X-Request-Id") || (0, crypto_1.randomUUID)()).trim();
    const startedAt = Date.now();
    req.requestId = requestId;
    res.setHeader("X-Request-Id", requestId);
    res.on("finish", () => {
        logger_1.logger.info("request.completed", {
            requestId,
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Date.now() - startedAt,
        });
    });
    next();
};
exports.requestContext = requestContext;
