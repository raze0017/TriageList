"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../config/logger");
const app_error_1 = require("../errors/app-error");
const errorHandler = (error, req, res, _next) => {
    const requestId = req.requestId;
    if (error instanceof app_error_1.AppError) {
        logger_1.logger.error("request.failed", { requestId, code: error.code, message: error.message });
        res.status(error.statusCode).json({
            error: {
                code: error.code,
                message: error.message,
                details: error.details ?? null,
            },
            requestId,
        });
        return;
    }
    logger_1.logger.error("request.failed.unhandled", { requestId, error });
    res.status(500).json({
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred.",
            details: null,
        },
        requestId,
    });
};
exports.errorHandler = errorHandler;
