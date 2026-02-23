"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listJdHandler = exports.createJdHandler = void 0;
const jd_service_1 = require("./jd.service");
const jd_validation_1 = require("./jd.validation");
const createJdHandler = async (req, res, next) => {
    try {
        const input = (0, jd_validation_1.validateCreateJdInput)(req.body);
        const jd = await (0, jd_service_1.createJd)(input);
        res.status(201).json({
            data: {
                id: jd.id,
                title: jd.title,
                created_at: jd.createdAt.toISOString(),
            },
            requestId: req.requestId,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createJdHandler = createJdHandler;
const listJdHandler = async (req, res, next) => {
    try {
        const query = (0, jd_validation_1.validateListJdQuery)({
            search: typeof req.query.search === "string" ? req.query.search : undefined,
            page: typeof req.query.page === "string" ? req.query.page : undefined,
            pageSize: typeof req.query.pageSize === "string" ? req.query.pageSize : undefined,
            sortBy: typeof req.query.sortBy === "string" ? req.query.sortBy : undefined,
            order: typeof req.query.order === "string" ? req.query.order : undefined,
        });
        const data = await (0, jd_service_1.listJds)(query);
        res.setHeader("Cache-Control", "private, max-age=30");
        res.status(200).json({
            data,
            requestId: req.requestId,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.listJdHandler = listJdHandler;
