# TriageList .NET 10 Backend

This is the idiomatic C# / .NET 10 Web API implementation of the TriageList backend, built using a **Feature-Module / Vertical Slice Architecture** that directly mirrors the modular organization of the original Node.js codebase.

## Architecture

- **Pattern:** Vertical Slice / Feature Modules (`Modules/<Feature>/...`)
- **Framework:** ASP.NET Core (.NET 10)
- **Database / ORM:** Entity Framework Core with `Npgsql.EntityFrameworkCore.PostgreSQL` and `EFCore.NamingConventions` (snake_case column and table mapping matching PostgreSQL conventions).
- **Background Jobs:** `Hangfire` backed by PostgreSQL (no Redis required).
- **PDF Extraction:** `UglyToad.PdfPig` (in-memory extraction).
- **Validation:** `FluentValidation.AspNetCore`.
- **LLM Signal Extraction:** Typed `HttpClient` calling Google Gemini 2.5 Flash API with strict JSON schema parsing into domain enums.
- **API Documentation:** Swagger / OpenAPI UI at `/swagger`.
- **Job Dashboard:** Hangfire Dashboard at `/hangfire`.

## Feature-Module Directory Structure

```
backend-dotnet/
├── Modules/
│   ├── Jd/
│   │   ├── JdsController.cs       # POST /api/v1/jds, GET /api/v1/jds, GET /api/v1/jds/{id}/applications
│   │   ├── JdContracts.cs         # DTOs: CreateJdRequest, JdResponse, TriageApplicationItem
│   │   └── JdValidation.cs        # FluentValidation rules for JDs
│   ├── Applications/
│   │   ├── ApplicationsController.cs # POST /api/v1/applications, GET /api/v1/applications/{id}, GET .../file
│   │   ├── ApplicationContracts.cs   # Form and response DTOs
│   │   ├── ApplicationValidation.cs  # FluentValidation rules for uploads
│   │   └── Storage/
│   │       └── PdfExtractor.cs       # PdfPig text extraction from resume stream
│   ├── Extraction/
│   │   ├── SignalExtractionService.cs # Gemini AI 6-signal extraction worker
│   │   └── ExtractionContracts.cs     # Gemini JSON output contract
│   └── Health/
│       └── HealthEndpoints.cs     # GET /api/v1/health
├── Common/
│   ├── Data/
│   │   └── AppDbContext.cs        # EF Core DbContext with Postgres enum & JSONB mapping
│   ├── Entities/
│   │   └── Entities.cs            # JdVersion, Application, JobApplication, CandidateSignal
│   └── Enums/
│       └── Enums.cs               # ApplicationStatus, ExperienceBand, Level, etc.
├── appsettings.json
├── Program.cs
└── TriageList.Api.csproj
```

## Running Locally

### 1. Requirements
- [.NET 10 SDK](https://dotnet.microsoft.com/)
- PostgreSQL 15+

### 2. Configure Settings
Update `appsettings.json` (or set environment variables):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=appdb;Username=appuser;Password=apppass"
  },
  "Gemini": {
    "ApiKey": "YOUR_GEMINI_API_KEY",
    "Model": "gemini-2.5-flash"
  }
}
```

### 3. Run Migrations & Start
```bash
cd backend-dotnet
dotnet restore
dotnet run
```

Endpoints available:
- **API Base:** `http://localhost:5000/api/v1`
- **Swagger UI:** `http://localhost:5000/swagger`
- **Hangfire Jobs:** `http://localhost:5000/hangfire`
