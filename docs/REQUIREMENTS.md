# TriageList — Requirements

## Project Purpose

> "TriageList extracts structured signals from job applications to help reviewers prioritize candidates transparently."

**Origin:** Built to solve a real problem — HR teams spending too much time manually reviewing applications and still missing strong candidates. TriageList surfaces the best-fit applicants first, so human reviewers spend their time on judgment, not sifting.

---

## Non-Goals (Frozen — Do Not Debate)

These are explicitly out of scope for the MVP:

- ❌ No automatic rejection of any candidate
- ❌ No automatic hiring or shortlisting
- ❌ No "AI picks the top 5" feature
- ❌ No bias scoring or fairness ranking system
- ❌ No production-grade authentication
- ❌ No MongoDB or secondary databases

---

## Users

| User                    | Role                                                                |
| ----------------------- | ------------------------------------------------------------------- |
| HR Reviewer             | Uploads resumes, sets JD context, filters and sorts the triage list |
| (Future) Hiring Manager | Views prioritized list, clicks through to original resume           |

Primary user for MVP: **1 HR person at a real company.** Build for her.

---

## The 6 Frozen Signals

These are the only attributes the AI will extract. No additions until after MVP.

| #   | Attribute           | Type             | Values                                     |
| --- | ------------------- | ---------------- | ------------------------------------------ |
| 1   | Primary Skills      | Array of strings | e.g. `["Node.js", "PostgreSQL"]`           |
| 2   | Experience Band     | Enum             | `0–1`, `1–3`, `3–5`, `5+` (years)          |
| 3   | Domain Alignment    | Enum             | `low`, `medium`, `high`                    |
| 4   | Resume Completeness | Enum             | `low`, `medium`, `high`                    |
| 5   | Ambiguity Flag      | Boolean          | `true` = AI is not confident in extraction |
| 6   | JD Match Score      | Enum             | `low`, `medium`, `high`                    |

> **Note on Signal 4:** Completeness is not a simple boolean. A resume missing dates is different from one missing skills entirely. Use low/medium/high to capture degrees of incompleteness.

> **Note on Signal 6:** JD Match Score is **enum only (low/medium/high)**. Do not implement as a raw numeric score for MVP — consistency matters more than precision at this stage.

---

## Data Flow

```
Applicant Submits (Google Form / Direct Upload)
            ↓
    PDF + Form Metadata
            ↓
    Backend Ingestion (Node/Express)
            ↓
    PostgreSQL — Raw Storage
    (original file path + raw JSONB text)
            ↓
    AI Extraction Worker (Async)
    (extracts the 6 frozen signals)
            ↓
    PostgreSQL — Structured Signals Table
            ↓
    Filtering + Sorting UI
    (reviewer sees prioritized list)
```

**Single source of truth: PostgreSQL. No exceptions.**

---

## Database Tables (Conceptual)

### `applications`

Stores the raw submission.

| Column         | Type      | Notes                                             |
| -------------- | --------- | ------------------------------------------------- |
| id             | UUID      | Primary key                                       |
| jd_id          | UUID      | FK → jd_versions                                  |
| applicant_name | text      | From form                                         |
| email          | text      | From form                                         |
| file_path      | text      | Path to stored PDF                                |
| raw_text       | JSONB     | Extracted text from PDF                           |
| status         | enum      | `pending`, `processing`, `ready`, `unprocessable` |
| submitted_at   | timestamp |                                                   |

### `candidate_signals`

Stores structured AI output.

| Column              | Type      | Notes                     |
| ------------------- | --------- | ------------------------- |
| id                  | UUID      | Primary key               |
| application_id      | UUID      | FK → applications         |
| primary_skills      | text[]    | Array of skill strings    |
| experience_band     | enum      | `0-1`, `1-3`, `3-5`, `5+` |
| domain_alignment    | enum      | `low`, `medium`, `high`   |
| resume_completeness | enum      | `low`, `medium`, `high`   |
| ambiguity_flag      | boolean   | True = low confidence     |
| jd_match_score      | enum      | `low`, `medium`, `high`   |
| extracted_at        | timestamp |                           |

### `jd_versions`

Stores job descriptions.

| Column      | Type      | Notes                  |
| ----------- | --------- | ---------------------- |
| id          | UUID      | Primary key            |
| title       | text      | Job title              |
| raw_jd_text | text      | Full JD pasted by user |
| created_at  | timestamp |                        |

### `match_scores` _(future)_

Reserved for when scoring logic becomes more complex. Not needed for MVP.

---

## Must-Have Feature Requirements

### 1. Ingestion

- Accepts PDF resumes
- Every application must be linked to a specific `jd_id` — no orphan resumes
- Saves original file path to storage
- Saves raw extracted text as JSONB in `applications`
- If file is unreadable/corrupt/not a resume → status set to `unprocessable`, no crash

### 2. AI Extraction

- Runs **asynchronously** — does not block the upload response
- Returns **only** the 6 frozen signals, nothing else
- If confidence is low on any signal → sets `ambiguity_flag = true`
- Output must be validated against a strict schema before writing to DB

### 3. Reviewer UI

- Shows list of all applications for a given JD
- Columns: Name, JD Match Score, Experience Band, Domain Alignment, Completeness, Ambiguity, Skills
- **Sortable** by JD Match Score (High → Low)
- **Filterable** by Experience Band, Domain Alignment, JD Match Score
- Each row has a link to view/download the **original PDF**
- Each row has a collapsible panel showing the **raw extracted text** (for trust/debugging)
- Status column shows: `Processing` or `Ready` or `Unprocessable`

### 4. Async Status

- Upload responds immediately with `application_id` and `status: pending`
- UI polls or refreshes to update status from `processing` → `ready`
- No UI freeze during AI extraction

### 5. JD Management

- Reviewer can create a JD by pasting raw text + giving it a title
- Each JD gets a unique ID that applications are linked to
- Applications can be grouped/filtered by JD session

---

## Must-Not Requirements (Hard Constraints)

- Must NOT make any hiring decisions automatically
- Must NOT reject any candidate without human review
- Must NOT display a confidence score as a definitive ranking
- Must NOT silently fail — every error must have a visible status

---

## Success Criteria for MVP

The tool is working when a real HR reviewer can:

1. Paste a JD and get a JD ID
2. Upload 10+ resumes linked to that JD
3. Wait for async processing without the UI breaking
4. Sort the list by match score and immediately see who to look at first
5. Click through to the original PDF to verify any AI output
6. See the ambiguity flag on vague resumes and know to review those manually

---

## Out of Scope (Post-MVP Ideas — Do Not Build Now)

- Email notifications when processing is complete
- Multi-user / team collaboration
- Interview scheduling
- ATS integration
- Scoring math refinement
- Authentication / role-based access
