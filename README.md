

# TriageList

> Structured resume triage for human-first hiring workflows.

<p>
  <img src="https://i.ibb.co/nXqh71p/logo.png" alt="TriageList Logo" width="100" />
</p>
TriageList extracts a small, explicitly bounded set of structured signals from job applications to help reviewers prioritize candidates transparently — without automating hiring decisions.

This is not an ATS replacement.  
This is not automated hiring.  
This is a triage layer.

---

## Why TriageList Exists

HR teams often:

- Manually review dozens (or hundreds) of resumes
- Spend time parsing formatting instead of evaluating candidates
- Miss strong applicants buried in volume

TriageList introduces a controlled signal-extraction layer.

Instead of ranking candidates numerically, it extracts a fixed set of structured attributes that support human decision-making.

Humans decide.  
AI structures.

---

## Core Design Principles

- Human-in-the-loop only
- No automated rejection
- No hidden scoring math
- No black-box ranking
- PostgreSQL as single source of truth
- Strict schema validation before persistence
- Explicit async processing model

Scope discipline is intentional.

---

## The 6 Frozen Signals (MVP Contract)

The AI extracts only the following attributes:

1. **Primary Skills** — `text[]`
2. **Experience Band** — `enum (0-1, 1-3, 3-5, 5+)`
3. **Domain Alignment** — `enum (low, medium, high)`
4. **Resume Completeness** — `enum (low, medium, high)`
5. **Ambiguity Flag** — `boolean`
6. **JD Match Score** — `enum (low, medium, high)`

No additional signals are allowed in MVP.

Consistency > cleverness.



### Architectural Properties

- Upload is non-blocking
- Extraction is asynchronous
- Raw resume text is preserved
- Signals are validated against strict schema
- UI reflects processing status explicitly
- No silent failures

---

## Database Model (Conceptual)

### `applications`

Stores raw submissions.

- id (UUID)
- jd_id (FK)
- applicant_name (text)
- email (text)
- file_path (text)
- raw_text (JSONB)
- status (enum: pending, processing, ready, unprocessable)
- submitted_at (timestamp)

---

### `candidate_signals`

Stores structured AI output.

- id (UUID)
- application_id (FK)
- primary_skills (text[])
- experience_band (enum)
- domain_alignment (enum)
- resume_completeness (enum)
- ambiguity_flag (boolean)
- jd_match_score (enum)
- extracted_at (timestamp)

---

### `jd_versions`

Stores job descriptions.

- id (UUID)
- title (text)
- raw_jd_text (text)
- created_at (timestamp)

---

## Technology Stack

### Frontend
- Next.js (App Router)
- Tailwind CSS
- Framer Motion

### Backend
- Node.js
- Express
- PostgreSQL
- Async extraction worker

### Data Design
- JSONB raw text storage
- Enum-based normalization
- Strict foreign key constraints
- No secondary database

---

## What This Project Is Not

- ❌ Not a candidate ranking engine
- ❌ Not automated hiring
- ❌ Not a fairness scoring system
- ❌ Not a full ATS
- ❌ Not a production authentication system (MVP)

This project intentionally solves one problem well:

> Structured triage before human evaluation.

---

## Development Status

🚧 Development in Progress

- Signal contract frozen
- Ingestion pipeline defined
- Async processing model designed
- Frontend triage UI under construction
- Schema validation enforced before persistence

---

## Success Criteria (MVP)

A real HR reviewer should be able to:

1. Paste a job description
2. Upload 10+ resumes linked to that JD
3. Wait for async processing without UI blocking
4. Sort by JD Match Score
5. Click into original PDF for verification
6. See ambiguity flags and review manually

If those conditions are satisfied, the system is working.

---

## Future Scope (Post-MVP)

- Email notifications
- Multi-reviewer workflows
- ATS integrations
- Authentication layer
- Advanced scoring models
- Analytics dashboard

Explicitly out of MVP.

---

## Design Philosophy

Most AI hiring tools optimize for automation.

TriageList optimizes for clarity.

The goal is not to replace judgment —  
it is to reduce noise.

---

## Repository

GitHub: https://github.com/raze0017/TriageList
