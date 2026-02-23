"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jdRouter = void 0;
const express_1 = require("express");
const jd_controller_1 = require("./jd.controller");
exports.jdRouter = (0, express_1.Router)();
exports.jdRouter.post("/", jd_controller_1.createJdHandler);
exports.jdRouter.get("/", jd_controller_1.listJdHandler);
