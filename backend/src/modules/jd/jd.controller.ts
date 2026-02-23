import { NextFunction, Request, Response } from "express";
import { createJd, listJds } from "./jd.service";
import { validateCreateJdInput, validateListJdQuery } from "./jd.validation";

export const createJdHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = validateCreateJdInput(req.body);
    const jd = await createJd(input);

    res.status(201).json({
      data: {
        id: jd.id,
        title: jd.title,
        created_at: jd.createdAt.toISOString(),
      },
      requestId: req.requestId,
    });
  } catch (error) {
    next(error);
  }
};

export const listJdHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = validateListJdQuery({
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      page: typeof req.query.page === "string" ? req.query.page : undefined,
      pageSize: typeof req.query.pageSize === "string" ? req.query.pageSize : undefined,
      sortBy: typeof req.query.sortBy === "string" ? req.query.sortBy : undefined,
      order: typeof req.query.order === "string" ? req.query.order : undefined,
    });

    const data = await listJds(query);
    res.setHeader("Cache-Control", "private, max-age=30");
    res.status(200).json({
      data,
      requestId: req.requestId,
    });
  } catch (error) {
    next(error);
  }
};
