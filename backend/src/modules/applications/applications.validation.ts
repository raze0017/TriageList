import { AppError } from "../../errors/app-error";

const NAME_MIN_LEN = 2;
const NAME_MAX_LEN = 100;

export type CreateApplicationInput = {
  jdId: string;
  applicantName: string;
  email: string;
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

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidUuid = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const validateCreateApplicationInput = (body: unknown): CreateApplicationInput => {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "INVALID_BODY", "Request body must be a JSON object.");
  }

  const raw = body as Record<string, unknown>;
  const jdId = asNonEmptyString(raw.jd_id ?? raw.jdId);
  const applicantName = asNonEmptyString(raw.applicant_name ?? raw.applicantName);
  const email = asNonEmptyString(raw.email);

  if (!jdId || !isValidUuid(jdId)) {
    throw new AppError(422, "VALIDATION_ERROR", "Invalid jd_id. Must be a valid UUID.");
  }

  if (!applicantName || applicantName.length < NAME_MIN_LEN || applicantName.length > NAME_MAX_LEN) {
    throw new AppError(422, "VALIDATION_ERROR", `Invalid applicant_name. Must be between ${NAME_MIN_LEN} and ${NAME_MAX_LEN} characters.`);
  }

  if (!email || !isValidEmail(email)) {
    throw new AppError(422, "VALIDATION_ERROR", "Invalid email format.");
  }

  return { jdId, applicantName, email };
};
