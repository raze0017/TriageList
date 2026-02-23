import { AppError } from "../../errors/app-error";

const TITLE_MIN_LEN = 2;
const TITLE_MAX_LEN = 120;
const JD_TEXT_MIN_LEN = 30;
const JD_TEXT_MAX_LEN = 30_000;
const PAGE_DEFAULT = 1;
const PAGE_SIZE_DEFAULT = 20;
const PAGE_SIZE_MAX = 100;

export type CreateJdInput = {
  title: string;
  rawJdText: string;
};

export type ListJdQuery = {
  search?: string;
  page: number;
  pageSize: number;
  sortBy: "createdAt" | "title";
  order: "asc" | "desc";
};

const sanitizeText = (value: string): string =>
  value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const asNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const sanitized = sanitizeText(value);
  if (!sanitized) {
    return null;
  }
  return sanitized;
};

export const validateCreateJdInput = (body: unknown): CreateJdInput => {
  if (!body || typeof body !== "object") {
    throw new AppError(
      400,
      "INVALID_BODY",
      "Request body must be a JSON object.",
    );
  }

  const raw = body as Record<string, unknown>;
  const title = asNonEmptyString(raw.title);
  const rawJdText = asNonEmptyString(raw.raw_jd_text ?? raw.rawJdText);
  const details: string[] = [];
if (!title || title.length < TITLE_MIN_LEN || title.length > TITLE_MAX_LEN) {
  throw new AppError(422, "VALIDATION_ERROR", "Invalid title.");
}

if (
  !rawJdText ||
  rawJdText.length < JD_TEXT_MIN_LEN ||
  rawJdText.length > JD_TEXT_MAX_LEN
) {
  throw new AppError(422, "VALIDATION_ERROR", "Invalid raw_jd_text.");
}

  return { title, rawJdText };
};

const parseInteger = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new AppError(
      422,
      "VALIDATION_ERROR",
      "Pagination values must be positive integers.",
    );
  }
  return parsed;
};

export const validateListJdQuery = (
  query: Record<string, string | undefined>,
): ListJdQuery => {
  const page = parseInteger(query.page, PAGE_DEFAULT);
  const pageSize = parseInteger(query.pageSize, PAGE_SIZE_DEFAULT);
  if (pageSize > PAGE_SIZE_MAX) {
    throw new AppError(
      422,
      "VALIDATION_ERROR",
      `pageSize cannot exceed ${PAGE_SIZE_MAX}.`,
    );
  }

  const sortBy = query.sortBy === "title" ? "title" : "createdAt";
  const order = query.order === "asc" ? "asc" : "desc";
  const searchRaw = query.search;
  const search = searchRaw ? sanitizeText(searchRaw) : undefined;

  return { page, pageSize, search, sortBy, order };
};
