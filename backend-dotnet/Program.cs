using FluentValidation.AspNetCore;
using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.EntityFrameworkCore;
using TriageList.Api.Common.Data;
using TriageList.Api.Modules.Applications.Storage;
using TriageList.Api.Modules.Extraction;
using TriageList.Api.Modules.Health;
using TriageList.Api.Modules.Jd;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Controllers & FluentValidation (scans all modules)
builder.Services.AddControllers();
builder.Services.AddFluentValidation(fv => fv.RegisterValidatorsFromAssemblyContaining<CreateJdRequestValidator>());

// 2. Database (PostgreSQL via EF Core with snake_case naming convention)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? throw new InvalidOperationException("DefaultConnection is not configured.");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString)
           .UseSnakeCaseNamingConvention();
});

// 3. Hangfire background jobs (persisted to PostgreSQL)
builder.Services.AddHangfire(configuration => configuration
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UsePostgreSqlStorage(options =>
    {
        options.UseNpgsqlConnection(connectionString);
    }));

builder.Services.AddHangfireServer(options =>
{
    options.WorkerCount = Environment.ProcessorCount * 2;
});

// 4. Register Module Services & Typed HttpClient
builder.Services.AddScoped<IPdfExtractor, PdfPigExtractor>();
builder.Services.AddHttpClient<ISignalExtractionService, SignalExtractionService>();

// 5. CORS
var allowedOrigin = builder.Configuration["Cors:Origin"] ?? "*";
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        if (allowedOrigin == "*")
        {
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
        }
        else
        {
            policy.WithOrigins(allowedOrigin).AllowAnyHeader().AllowAnyMethod();
        }
    });
});

// 6. OpenAPI / Swagger Documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure Middleware Pipeline
app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Hangfire Dashboard (available at /hangfire)
app.UseHangfireDashboard("/hangfire");

app.MapControllers();

// Health check endpoint (mapped from Health module)
app.MapHealthEndpoints();

app.Run();
