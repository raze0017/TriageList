"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = __importDefault(require("node:test"));
const app_error_1 = require("../../errors/app-error");
const jd_validation_1 = require("./jd.validation");
(0, node_test_1.default)("validateCreateJdInput accepts valid payload", () => {
    const result = (0, jd_validation_1.validateCreateJdInput)({
        title: "Backend Engineer",
        raw_jd_text: "This is a long enough job description text with responsibilities and requirements.",
    });
    strict_1.default.equal(result.title, "Backend Engineer");
    strict_1.default.ok(result.rawJdText.includes("job description"));
});
(0, node_test_1.default)("validateCreateJdInput rejects invalid payload", () => {
    strict_1.default.throws(() => (0, jd_validation_1.validateCreateJdInput)({ title: "A", raw_jd_text: "short text" }), (error) => error instanceof app_error_1.AppError && error.statusCode === 422);
});
(0, node_test_1.default)("validateListJdQuery parses defaults", () => {
    const result = (0, jd_validation_1.validateListJdQuery)({});
    strict_1.default.equal(result.page, 1);
    strict_1.default.equal(result.pageSize, 20);
    strict_1.default.equal(result.sortBy, "createdAt");
    strict_1.default.equal(result.order, "desc");
});
(0, node_test_1.default)("validateListJdQuery rejects invalid page", () => {
    strict_1.default.throws(() => (0, jd_validation_1.validateListJdQuery)({ page: "0" }), (error) => error instanceof app_error_1.AppError && error.statusCode === 422);
});
