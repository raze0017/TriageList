export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "TriageList API",
    version: "1.0.0",
    description: "Versioned API for TriageList MVP.",
  },
  servers: [{ url: "/api/v1" }],
  paths: {
    "/health": {
      get: {
        summary: "Service health check",
        responses: {
          "200": {
            description: "Service healthy",
          },
        },
      },
    },
    "/jd": {
      post: {
        summary: "Create a Job Description version (legacy singular route)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "raw_jd_text"],
                properties: {
                  title: { type: "string", minLength: 2, maxLength: 120 },
                  raw_jd_text: { type: "string", minLength: 30, maxLength: 30000 },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "JD created",
          },
          "422": {
            description: "Validation error",
          },
        },
      },
    },
    "/jds": {
      post: {
        summary: "Create a Job Description version",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "raw_jd_text"],
                properties: {
                  title: { type: "string", minLength: 2, maxLength: 120 },
                  raw_jd_text: { type: "string", minLength: 30, maxLength: 30000 },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "JD created",
          },
          "422": {
            description: "Validation error",
          },
        },
      },
      get: {
        summary: "List JDs with filtering/sorting/pagination",
        parameters: [
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
          { name: "sortBy", in: "query", schema: { type: "string", enum: ["createdAt", "title"] } },
          { name: "order", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
        ],
        responses: {
          "200": {
            description: "JDs fetched",
          },
        },
      },
    },
  },
} as const;
