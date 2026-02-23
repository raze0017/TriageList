"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiV1Router = void 0;
const express_1 = require("express");
const openapi_1 = require("../docs/openapi");
const health_routes_1 = require("../modules/health/health.routes");
const jd_controller_1 = require("../modules/jd/jd.controller");
const jd_routes_1 = require("../modules/jd/jd.routes");
exports.apiV1Router = (0, express_1.Router)();
exports.apiV1Router.use("/health", health_routes_1.healthRouter);
exports.apiV1Router.use("/jds", jd_routes_1.jdRouter);
exports.apiV1Router.post("/jd", jd_controller_1.createJdHandler);
exports.apiV1Router.get("/docs", (_req, res) => {
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.status(200).json(openapi_1.openApiDocument);
});
