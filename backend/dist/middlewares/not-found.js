"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const app_error_1 = require("../errors/app-error");
const notFoundHandler = (req, _res, next) => {
    next(new app_error_1.AppError(404, "NOT_FOUND", `Route not found: ${req.method} ${req.originalUrl}`));
};
exports.notFoundHandler = notFoundHandler;
