import assert from "node:assert/strict";
import test from "node:test";
import { AppError } from "../../errors/app-error";
import { validateCreateJdInput, validateListJdQuery } from "./jd.validation";

test("validateCreateJdInput accepts valid payload", () => {
  const result = validateCreateJdInput({
    title: "Backend Engineer",
    raw_jd_text: "This is a long enough job description text with responsibilities and requirements.",
  });

  assert.equal(result.title, "Backend Engineer");
  assert.ok(result.rawJdText.includes("job description"));
});

test("validateCreateJdInput rejects invalid payload", () => {
  assert.throws(
    () => validateCreateJdInput({ title: "A", raw_jd_text: "short text" }),
    (error: unknown) => error instanceof AppError && error.statusCode === 422,
  );
});

test("validateListJdQuery parses defaults", () => {
  const result = validateListJdQuery({});
  assert.equal(result.page, 1);
  assert.equal(result.pageSize, 20);
  assert.equal(result.sortBy, "createdAt");
  assert.equal(result.order, "desc");
});

test("validateListJdQuery rejects invalid page", () => {
  assert.throws(
    () => validateListJdQuery({ page: "0" }),
    (error: unknown) => error instanceof AppError && error.statusCode === 422,
  );
});
