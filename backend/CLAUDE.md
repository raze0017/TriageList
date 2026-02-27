# CLAUDE.md — Backend

## Stack
- **Runtime:** Node.js + TypeScript 5 (strict, CommonJS, ES2020)
- **Framework:** Express 5
- **ORM:** Prisma 6 → PostgreSQL 15
- **Dev server:** ts-node-dev (`--respawn --transpile-only`)

## Commands
```bash
npm run dev     # hot-reload dev server on :4000
npm run build   # tsc → dist/
npm run start   # node dist/index.js
npm run test    # build + node --test dist/**/*.test.js
```

## Docker
```bash
docker-compose up -d   # starts postgres:5432 + API:4000 + Prisma Studio:5555
```
`.env` required: `PORT=4000`, `DATABASE_URL=postgresql://appuser:apppass@postgres:5432/appdb`

## Folder Structure
```
src/
  modules/<feature>/     # feature slice: controller, service, routes, validation, test
  middlewares/           # express middleware (kebab-case filenames)
  routes/v1.ts           # mounts all module routers under /api/v1
  errors/app-error.ts    # AppError(statusCode, code, message, details?)
  lib/prisma.ts          # singleton PrismaClient
  config/                # env.ts, logger.ts
  types/                 # express.d.ts augmentations
  generated/prisma/      # auto-generated — do not edit
```

## Module Conventions
Each feature in `src/modules/<entity>/` follows this pattern:

| File | Purpose |
|------|---------|
| `<entity>.routes.ts` | Registers Express routes |
| `<entity>.controller.ts` | Calls validate → service, returns response |
| `<entity>.service.ts` | Prisma queries, always uses `.select()` |
| `<entity>.validation.ts` | Parses/sanitizes input, throws `AppError` on failure |
| `<entity>.validation.test.ts` | Node native test runner tests |

## Naming
- Handlers: `create<Entity>Handler`, `list<Entity>Handler`
- Services: `createJd`, `listJds`
- Validators: `validateCreate<Entity>Input`, `validateList<Entity>Query`
- Exported types from validation: `Create<Entity>Input`, `List<Entity>Query`
- Constants: `SCREAMING_SNAKE_CASE`
- DB columns: snake_case via Prisma `@map()`; TypeScript uses camelCase

## API Shape
- Base: `/api/v1`
- Success: `{ data: ..., requestId: "uuid" }`
- Error: `{ error: { code: string, message: string, details: null }, requestId }`
- Throw `new AppError(httpStatus, "ERROR_CODE", "message")` anywhere — middleware handles it

## Middleware Stack (in order)
1. `request-context` — attaches `req.requestId`
2. `security-headers` — CSP, X-Frame-Options, etc.
3. CORS (`CORS_ORIGIN` env, default `*`)
4. `rate-limit` — in-memory
5. JSON body parser (1 MB max)
6. Routes
7. `not-found` → 404
8. `error-handler` → serialises `AppError` or 500