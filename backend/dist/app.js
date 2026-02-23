"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const env_1 = require("./config/env");
const v1_1 = require("./routes/v1");
const error_handler_1 = require("./middlewares/error-handler");
const not_found_1 = require("./middlewares/not-found");
const rate_limit_1 = require("./middlewares/rate-limit");
const request_context_1 = require("./middlewares/request-context");
const security_headers_1 = require("./middlewares/security-headers");
const createApp = () => {
    const app = (0, express_1.default)();
    app.disable("x-powered-by");
    app.use(request_context_1.requestContext);
    app.use(security_headers_1.securityHeaders);
    app.use((0, cors_1.default)({
        origin: env_1.env.CORS_ORIGIN,
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "X-Request-Id"],
        credentials: false,
        maxAge: 600,
    }));
    app.use(rate_limit_1.rateLimit);
    app.use(express_1.default.json({ limit: "1mb" }));
    app.use("/api/v1", v1_1.apiV1Router);
    app.use(not_found_1.notFoundHandler);
    app.use(error_handler_1.errorHandler);
    return app;
};
exports.createApp = createApp;
