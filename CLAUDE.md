# CLAUDE.md

## Project Overview
Monorepo: ATS (Applicant Tracking System) with separate `frontend/` and `backend/` apps.

## Tech Stack

**Backend** (`backend/`)
- Node.js + Express 5 + TypeScript (strict, CommonJS, ES2020 target)
- Prisma 6 ORM with PostgreSQL 15
- ts-node-dev for hot-reload in dev

**Frontend** (`frontend/`)
- Next.js 16 (App Router), JavaScript (JSX)
- Tailwind CSS 4, Framer Motion, Lucide React

## Running Locally

```bash
# Start PostgreSQL via Docker
cd backend && docker-compose up -d

# Backend dev server (port 4000)
cd backend && npm run dev

# Frontend dev server (port 3000)
cd frontend && npm run dev
```

## Build & Test

```bash
# Backend
npm run build    # tsc → dist/
npm run start    # node dist/index.js
npm run test     # build + Node native test runner

# Frontend
npm run build    # Next.js production build
npm run lint     # ESLint
```

## Conventions

**Backend file naming** (in `src/modules/<feature>/`):
- `<entity>.controller.ts` / `.service.ts` / `.routes.ts` / `.validation.ts` / `.test.ts`
- Middleware: kebab-case (e.g., `error-handler.ts`, `security-headers.ts`)

**Naming patterns:**
- Handlers: `create<Entity>Handler`, `list<Entity>Handler`
- Services: verb + noun (`createJd`, `listJds`)
- Validation: `validate<Entity><Action>` returning typed input
- Constants: SCREAMING_SNAKE_CASE
- DB: snake_case tables/columns mapped via Prisma `@map()`; TypeScript uses camelCase

**Frontend** (App Router):
- Route groups: `(public)/` and `(private)/` under `src/app/`
- Components: PascalCase in `src/components/`
- Path alias: `@/*` → `src/*`

**API shape:**
- Base path: `/api/v1`
- Success: `{ data: ..., requestId: "uuid" }`
- Error: `{ error: { code, message, details }, requestId }`

## Key Config
- Backend env: `PORT=4000`, `DATABASE_URL=postgresql://appuser:apppass@postgres:5432/appdb`
- Prisma Studio: port 5555 (via docker-compose)
- CORS origin: `CORS_ORIGIN` env var (default `*`)
