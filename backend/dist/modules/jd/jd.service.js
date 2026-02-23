"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listJds = exports.createJd = void 0;
const prisma_1 = require("../../lib/prisma");
const createJd = async (input) => {
    const jdVersion = await prisma_1.prisma.jdVersion.create({
        data: {
            title: input.title,
            rawJdText: input.rawJdText,
        },
        select: {
            id: true,
            title: true,
            createdAt: true,
        },
    });
    return jdVersion;
};
exports.createJd = createJd;
const listJds = async (query) => {
    const where = query.search
        ? {
            OR: [
                { title: { contains: query.search, mode: "insensitive" } },
                { rawJdText: { contains: query.search, mode: "insensitive" } },
            ],
        }
        : {};
    const skip = (query.page - 1) * query.pageSize;
    const [total, rows] = await Promise.all([
        prisma_1.prisma.jdVersion.count({ where }),
        prisma_1.prisma.jdVersion.findMany({
            where,
            orderBy: { [query.sortBy]: query.order },
            skip,
            take: query.pageSize,
            select: {
                id: true,
                title: true,
                createdAt: true,
            },
        }),
    ]);
    return {
        items: rows,
        meta: {
            page: query.page,
            pageSize: query.pageSize,
            total,
        },
    };
};
exports.listJds = listJds;
