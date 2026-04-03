# TriageList Backend — ClickUp Task List

> Copy each block as a separate ClickUp task. Suggested list order = build order.

---

## 📦 LIST: Infrastructure & Cleanup

---

### TASK: Remove duplicate POST /jd route from v1.ts
**Status:** ✅ Done (user already removed it)
**Details:**
- `apiV1Router.post("/jd", createJdHandler)` was a leftover — deleted.
- Canonical route is `POST /api/v1/jds` via `jdRouter`.

---

### TASK: Add `multer` and `pdf-parse` dependencies
**Priority:** High  
**Details:**
- Install `multer` for multipart/form-data file uploads
- Install `pdf-parse` (or `pdfjs-dist`) for PDF text extraction
- Install their TypeScript types: `@types/multer`, `@types/pdf-parse`
- Verify `express.json()` limit does not interfere with file uploads (it won't, multer is separate middleware)

---

### TASK: Add LLM SDK dependency
**Priority:** High  
**Details:**
- Decide on provider: OpenAI / Gemini / Anthropic
- Install SDK (e.g., `openai`, `@google/generative-ai`, or `@anthropic-ai/sdk`)
- Add `OPENAI_API_KEY` (or equivalent) to `.env` and `env.ts` config
- Add to `.env.example`

---

### TASK: Add async job queue dependency
**Priority:** High  
**Details:**
- Options: `bullmq` (Redis-backed) or `pg-boss` (Postgres-backed, simpler since you already have PG)
- Recommended: **`pg-boss`** — no extra Redis infra, uses existing Postgres
- Install `pg-boss`
- Update `docker-compose.yml` if Redis is chosen instead
- Create `src/lib/queue.ts` — singleton queue client (similar to `src/lib/prisma.ts`)

---

### TASK: Create file storage directory and config
**Priority:** High  
**Details:**
- Decide: local disk storage (MVP) or object storage (S3/R2)
- For MVP: create `uploads/` directory, add to `.gitignore`
- Add `UPLOAD_DIR` env var to `env.ts` and `.env.example`
- Add `MAX_FILE_SIZE_MB` env var (e.g., default 10MB)

---

## 📦 LIST: Applications Module

---

### TASK: Create `applications` module scaffold
**Priority:** High  
**Details:**
- Create `src/modules/applications/` directory
- Files to create:
  - `applications.routes.ts`
  - `applications.controller.ts`
  - `applications.service.ts`
  - `applications.validation.ts`
- Register router in `src/routes/v1.ts`: `apiV1Router.use("/applications", applicationsRouter)`

---

### TASK: Implement `POST /api/v1/applications` — Upload resume
**Priority:** High  
**Details:**
- Accepts: `multipart/form-data` with fields:
  - `file` — PDF file (required)
  - `jd_id` — UUID of the job description (required)
  - `applicant_name` — string (required)
  - `email` — string, valid email format (required)
- Validation:
  - `jd_id` must exist in `jd_versions` table (FK check)
  - File must be `application/pdf` MIME type
  - File size limit enforced (e.g., 10MB)
- Processing:
  - Save PDF to `UPLOAD_DIR/{uuid}.pdf`
  - Extract raw text from PDF using `pdf-parse`
  - If PDF is unreadable/corrupt: set `status = unprocessable`, do NOT crash
  - Store in `applications` table with `status = pending`
- Response (201):
  ```json
  { "data": { "id": "<uuid>", "status": "pending" }, "requestId": "..." }
  ```
- Enqueue an AI extraction job (see extraction worker task)

---

### TASK: Implement `GET /api/v1/applications/:id` — Get single application
**Priority:** Medium  
**Details:**
- Returns application metadata + current status
- Include `candidateSignal` if status is `ready`
- Useful for polling from the frontend after upload

---

### TASK: Implement `GET /api/v1/applications/:id/file` — Download original PDF
**Priority:** Medium  
**Details:**
- Stream the original PDF file from disk
- Set `Content-Type: application/pdf`
- Set `Content-Disposition: inline` (view in browser) or `attachment` (download) — decide
- Return 404 if file not found on disk
- Return 404 if application ID doesn't exist

---

## 📦 LIST: AI Extraction Worker

---

### TASK: Design LLM prompt for signal extraction
**Priority:** High  
**Details:**
- Prompt must instruct the LLM to extract **only** the 6 frozen signals:
  1. `primary_skills` — `string[]`
  2. `experience_band` — `"ZERO_TO_ONE" | "ONE_TO_THREE" | "THREE_TO_FIVE" | "FIVE_PLUS"`
  3. `domain_alignment` — `"low" | "medium" | "high"`
  4. `resume_completeness` — `"low" | "medium" | "high"`
  5. `ambiguity_flag` — `boolean`
  6. `jd_match_score` — `"low" | "medium" | "high"`
- Prompt must request **strict JSON output only** (no prose)
- Include JD text in the prompt so `jd_match_score` is JD-aware
- Set `ambiguity_flag = true` if any field has low confidence
- Create `src/modules/extraction/extraction.prompt.ts`

---

### TASK: Implement LLM response validation
**Priority:** High  
**Details:**
- After LLM call, parse JSON response
- Validate against strict schema (all 6 fields present, correct enum values)
- If validation fails → set application `status = unprocessable`, log error
- Do NOT write partial/invalid data to `candidate_signals`
- Create `src/modules/extraction/extraction.validation.ts`

---

### TASK: Implement async extraction worker
**Priority:** High  
**Details:**
- Create `src/modules/extraction/extraction.worker.ts`
- Worker listens for jobs on `extract-signals` queue
- On job received:
  1. Set `application.status = processing`
  2. Fetch application `rawText` and linked JD `rawJdText`
  3. Call LLM with extraction prompt
  4. Validate LLM response
  5. On success: write to `candidate_signals`, set `application.status = ready`
  6. On failure: set `application.status = unprocessable`, log structured error
- Worker must start with the Express app (wire into `src/index.ts`)

---

### TASK: Wire extraction job enqueue into upload handler
**Priority:** High  
**Details:**
- After successful PDF save + raw text extraction in `POST /applications`:
  - Enqueue job: `{ applicationId, jdId }` on `extract-signals` queue
- Job should be fire-and-forget (upload response must not wait for LLM)

---

## 📦 LIST: Job Applications Module (Triage List)

---

### TASK: Create `job_applications` module scaffold
**Priority:** Medium  
**Details:**
- Create `src/modules/job-applications/` directory
- Files:
  - `job-applications.routes.ts`
  - `job-applications.controller.ts`
  - `job-applications.service.ts`
  - `job-applications.validation.ts`
- Note: The `JobApplication` model in Prisma is the join table linking `Application` ↔ `JdVersion` with scoring output

---

### TASK: Implement `GET /api/v1/jds/:jdId/applications` — Triage list
**Priority:** High  
**Details:**
- This is the **core reviewer endpoint**
- Returns all applications linked to a JD, joined with `candidateSignal` data
- Response shape per item:
  ```json
  {
    "id": "<applicationId>",
    "applicant_name": "...",
    "email": "...",
    "status": "ready",
    "submitted_at": "...",
    "signals": {
      "primary_skills": ["..."],
      "experience_band": "THREE_TO_FIVE",
      "domain_alignment": "high",
      "resume_completeness": "medium",
      "ambiguity_flag": false,
      "jd_match_score": "high"
    }
  }
  ```
- **Filtering** (query params):
  - `experience_band` — filter by band
  - `domain_alignment` — `low | medium | high`
  - `jd_match_score` — `low | medium | high`
  - `status` — `pending | processing | ready | unprocessable`
- **Sorting** (query params):
  - `sortBy=jd_match_score` (default, High → Low)
  - `order=asc|desc`
- **Pagination**: `page`, `pageSize`
- Include applications with any status (show `Processing` / `Unprocessable` rows too — no hidden rows)

---

### TASK: Add `jd_id` index query to GET /jds/:id
**Priority:** Low  
**Details:**
- Add application count to `GET /api/v1/jds/:id` response
- e.g., `{ id, title, created_at, application_count: 12 }`
- Useful for the JD list screen in the frontend

---

## 📦 LIST: OpenAPI / Docs

---

### TASK: Update OpenAPI spec with all new endpoints
**Priority:** Low (do last)  
**Details:**
- Add schemas and paths for:
  - `POST /applications`
  - `GET /applications/:id`
  - `GET /applications/:id/file`
  - `GET /jds/:jdId/applications`
- Update existing `/jds` schema if needed
- File: `src/docs/openapi.ts`

---

## Summary Table

| # | Task | Priority | Module |
|---|------|----------|--------|
| 1 | Add multer + pdf-parse deps | High | Infra |
| 2 | Add LLM SDK dep | High | Infra |
| 3 | Add pg-boss (job queue) dep | High | Infra |
| 4 | File storage config | High | Infra |
| 5 | Applications module scaffold | High | Applications |
| 6 | POST /applications (upload) | High | Applications |
| 7 | GET /applications/:id | Medium | Applications |
| 8 | GET /applications/:id/file | Medium | Applications |
| 9 | Design LLM extraction prompt | High | AI Worker |
| 10 | LLM response validation | High | AI Worker |
| 11 | Async extraction worker | High | AI Worker |
| 12 | Wire enqueue into upload handler | High | AI Worker |
| 13 | job_applications module scaffold | Medium | Triage List |
| 14 | GET /jds/:jdId/applications (triage list) | High | Triage List |
| 15 | Add application count to GET /jds/:id | Low | Triage List |
| 16 | Update OpenAPI spec | Low | Docs |
