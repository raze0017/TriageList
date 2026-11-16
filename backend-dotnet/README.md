# TriageList .NET 10 Backend

This is the idiomatic C# / .NET 10 Web API implementation of the TriageList backend, replacing the Express/TypeScript service.

## Architecture

- **Framework:** ASP.NET Core (.NET 10)
- **Database / ORM:** Entity Framework Core with `Npgsql.EntityFrameworkCore.PostgreSQL` and `EFCore.NamingConventions` (snake_case column and table mapping matching PostgreSQL conventions).
- **Background Jobs:** `Hangfire` backed by PostgreSQL (no Redis required).
- **PDF Extraction:** `UglyToad.PdfPig` (in-memory extraction).
- **Validation:** `FluentValidation.AspNetCore`.
- **LLM Signal Extraction:** Typed `HttpClient` calling Google Gemini 2.5 Flash API with strict JSON schema parsing into domain enums.
- **API Documentation:** Swagger / OpenAPI UI at `/swagger`.
- **Job Dashboard:** Hangfire Dashboard at `/hangfire`.

## Project Structure

```
backend-dotnet/
├── Contracts/
│   └── Contracts.cs            # Request/Response DTOs & Gemini payload schema
├── Controllers/
│   ├── ApplicationsController.cs # Upload PDF, get status, download resume file
│   └── JdsController.cs         # Create JD, list JDs, get candidate triage list
├── Domain/
│   ├── Entities/
│   │   └── Entities.cs         # JdVersion, Application, JobApplication, CandidateSignal
│   └── Enums/
│       └── Enums.cs            # ApplicationStatus, ExperienceBand, Level, etc.
├── Infrastructure/
│   └── Data/
│       └── AppDbContext.cs     # EF Core DbContext with Postgres enum & JSONB mapping
├── Services/
│   ├── PdfExtractor.cs         # PdfPig text extraction
│   └── SignalExtractionService.cs # Gemini AI 6-signal extraction worker
├── Validation/
│   └── Validators.cs           # FluentValidation rules
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
