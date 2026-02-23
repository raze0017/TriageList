# Backend API

## Overview

TriageList backend uses Express + Prisma + PostgreSQL and exposes versioned REST APIs under `/api/v1`.

## Structure

```
src/
  app.ts
  index.ts
  config/
  docs/
  errors/
  lib/
  middlewares/
  modules/
    health/
    jd/
  routes/
```

## Implemented Endpoints

- `GET /api/v1/health` - health check
- `GET /api/v1/docs` - OpenAPI JSON documentation
- `POST /api/v1/jds` - create JD and return JD id (preferred)
- `POST /api/v1/jd` - create JD and return JD id (legacy singular alias)
- `GET /api/v1/jds` - list JDs with filtering/sorting/pagination

## POST /api/v1/jds

Request body:

```json
{
  "title": "Backend Engineer",
  "raw_jd_text": "Full job description text..."
}
```

Response (`201`):

```json
{
  "data": {
    "id": "uuid",
    "title": "Backend Engineer",
    "created_at": "2026-02-23T12:00:00.000Z"
  },
  "requestId": "uuid"
}
```

## Query Params for GET /api/v1/jds

- `search` string filter
- `page` positive integer (default `1`)
- `pageSize` positive integer up to `100` (default `20`)
- `sortBy` one of `createdAt | title` (default `createdAt`)
- `order` one of `asc | desc` (default `desc`)

## Security and Reliability

- CORS configured via `CORS_ORIGIN`
- request tracing with `X-Request-Id`
- basic in-memory rate limiting
- JSON body size limit (`1mb`)
- security headers (CSP, frame deny, nosniff, referrer policy)
- structured error responses
- graceful shutdown for `SIGINT` and `SIGTERM`

## Environment Variables

- `PORT` (default `4000`)
- `DATABASE_URL` (required)
- `CORS_ORIGIN` (default `*`)
- `NODE_ENV` (optional)

## Commands

- `npm run dev` - start in dev mode
- `npm run build` - compile TypeScript
- `npm run start` - run built app
- `npm run test` - compile and run tests
