"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateListJdQuery = exports.validateCreateJdInput = void 0;
const app_error_1 = require("../../errors/app-error");
const TITLE_MIN_LEN = 2;
const TITLE_MAX_LEN = 120;
const JD_TEXT_MIN_LEN = 30;
const JD_TEXT_MAX_LEN = 30000;
const PAGE_DEFAULT = 1;
const PAGE_SIZE_DEFAULT = 20;
const PAGE_SIZE_MAX = 100;
const sanitizeText = (value) => value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
const asNonEmptyString = (value) => {
    if (typeof value !== "string") {
        return null;
    }
    const sanitized = sanitizeText(value);
    if (!sanitized) {
        return null;
    }
    return sanitized;
};
const validateCreateJdInput = (body) => {
    if (!body || typeof body !== "object") {
        throw new app_error_1.AppError(400, "INVALID_BODY", "Request body must be a JSON object.");
    }
    const raw = body;
    const title = asNonEmptyString(raw.title);
    const rawJdText = asNonEmptyString(raw.raw_jd_text ?? raw.rawJdText);
    const details = [];
    if (!title || !rawJdText) {
        throw new app_error_1.AppError(422, "VALIDATION_ERROR", "Invalid JD payload.", details);
    }
    return { title, rawJdText };
};
exports.validateCreateJdInput = validateCreateJdInput;
const parseInteger = (value, fallback) => {
    if (!value) {
        return fallback;
    }
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) {
        throw new app_error_1.AppError(422, "VALIDATION_ERROR", "Pagination values must be positive integers.");
    }
    return parsed;
};
const validateListJdQuery = (query) => {
    const page = parseInteger(query.page, PAGE_DEFAULT);
    const pageSize = parseInteger(query.pageSize, PAGE_SIZE_DEFAULT);
    if (pageSize > PAGE_SIZE_MAX) {
        throw new app_error_1.AppError(422, "VALIDATION_ERROR", `pageSize cannot exceed ${PAGE_SIZE_MAX}.`);
    }
    const sortBy = query.sortBy === "title" ? "title" : "createdAt";
    const order = query.order === "asc" ? "asc" : "desc";
    const searchRaw = query.search;
    const search = searchRaw ? sanitizeText(searchRaw) : undefined;
    return { page, pageSize, search, sortBy, order };
};
exports.validateListJdQuery = validateListJdQuery;
