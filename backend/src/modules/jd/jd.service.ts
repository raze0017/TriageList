import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { CreateJdInput, ListJdQuery } from "./jd.validation";

export const createJd = async (input: CreateJdInput) => {
  const jdVersion = await prisma.jdVersion.create({
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

export const listJds = async (query: ListJdQuery) => {
  const where: Prisma.JdVersionWhereInput = query.search
    ? {
        OR: [
          { title: { contains: query.search, mode: "insensitive" } },
          { rawJdText: { contains: query.search, mode: "insensitive" } },
        ],
      }
    : {};

  const skip = (query.page - 1) * query.pageSize;
  const [total, rows] = await Promise.all([
    prisma.jdVersion.count({ where }),
    prisma.jdVersion.findMany({
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
