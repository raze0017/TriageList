using System.Text.Json;
using Hangfire;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TriageList.Api.Common.Data;
using TriageList.Api.Common.Entities;
using TriageList.Api.Common.Enums;
using TriageList.Api.Modules.Applications.Storage;
using TriageList.Api.Modules.Extraction;

namespace TriageList.Api.Modules.Applications;

[ApiController]
[Route("api/v1/applications")]
public class ApplicationsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IPdfExtractor _pdfExtractor;
    private readonly IBackgroundJobClient _backgroundJobs;
    private readonly IConfiguration _config;
    private readonly ILogger<ApplicationsController> _logger;

    public ApplicationsController(
        AppDbContext db,
        IPdfExtractor pdfExtractor,
        IBackgroundJobClient backgroundJobs,
        IConfiguration config,
        ILogger<ApplicationsController> logger)
    {
        _db = db;
        _pdfExtractor = pdfExtractor;
        _backgroundJobs = backgroundJobs;
        _config = config;
        _logger = logger;
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Upload([FromForm] CreateApplicationForm form, CancellationToken ct)
    {
        var jd = await _db.JdVersions.FindAsync(new object[] { form.JdId }, ct);
        if (jd == null)
        {
            return NotFound(new { error = new { code = "NOT_FOUND", message = "The specified Job Description does not exist." } });
        }

        var applicationId = Guid.NewGuid();
        var uploadDir = _config["Storage:UploadDir"] ?? "uploads";
        Directory.CreateDirectory(uploadDir);

        var finalPath = Path.Combine(uploadDir, $"{applicationId}.pdf");
        var status = ApplicationStatus.Pending;
        string rawText = string.Empty;

        try
        {
            await using (var fileStream = new FileStream(finalPath, FileMode.Create))
            {
                await form.File.CopyToAsync(fileStream, ct);
            }

            // Extract text from PDF
            await using (var readStream = new FileStream(finalPath, FileMode.Open, FileAccess.Read))
            {
                rawText = _pdfExtractor.ExtractText(readStream);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to extract text from PDF for application {ApplicationId}", applicationId);
            status = ApplicationStatus.Unprocessable;
        }

        var rawTextJson = JsonDocument.Parse(JsonSerializer.Serialize(new { content = rawText }));

        var application = new Application
        {
            Id = applicationId,
            ApplicantName = form.ApplicantName.Trim(),
            Email = form.Email.Trim(),
            FilePath = finalPath,
            RawText = rawTextJson,
            Status = status,
            SubmittedAt = DateTime.UtcNow
        };

        var jobApplication = new JobApplication
        {
            JdId = form.JdId,
            ApplicationId = application.Id,
            Status = JobApplicationStatus.Pending
        };

        _db.Applications.Add(application);
        _db.JobApplications.Add(jobApplication);
        await _db.SaveChangesAsync(ct);

        // Enqueue background extraction with Hangfire if status is Pending
        if (status == ApplicationStatus.Pending)
        {
            _backgroundJobs.Enqueue<ISignalExtractionService>(service =>
                service.ExtractSignalsAsync(application.Id, form.JdId, CancellationToken.None));
        }

        return StatusCode(201, new
        {
            data = new ApplicationCreatedResponse(application.Id, application.Status.ToString().ToLower()),
            requestId = HttpContext.TraceIdentifier
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var application = await _db.Applications
            .AsNoTracking()
            .Include(a => a.CandidateSignal)
            .FirstOrDefaultAsync(a => a.Id == id, ct);

        if (application == null)
        {
            return NotFound(new { error = new { code = "NOT_FOUND", message = "Application not found." } });
        }

        var response = new ApplicationDetailResponse(
            application.Id,
            application.ApplicantName,
            application.Email,
            application.Status.ToString().ToLower(),
            application.SubmittedAt,
            application.CandidateSignal == null ? null : new ApplicationCandidateSignalResponse(
                application.CandidateSignal.PrimarySkills,
                application.CandidateSignal.ExperienceBand.ToString(),
                application.CandidateSignal.DomainAlignment.ToString().ToLower(),
                application.CandidateSignal.ResumeCompleteness.ToString().ToLower(),
                application.CandidateSignal.AmbiguityFlag,
                application.CandidateSignal.JdMatchScore.ToString().ToLower(),
                application.CandidateSignal.ExtractedAt
            )
        );

        return Ok(new { data = response, requestId = HttpContext.TraceIdentifier });
    }

    [HttpGet("{id}/file")]
    public async Task<IActionResult> DownloadFile(Guid id, CancellationToken ct)
    {
        var application = await _db.Applications.FindAsync(new object[] { id }, ct);

        if (application == null || !System.IO.File.Exists(application.FilePath))
        {
            return NotFound(new { error = new { code = "NOT_FOUND", message = "File not found." } });
        }

        var stream = new FileStream(application.FilePath, FileMode.Open, FileAccess.Read);
        Response.Headers.Append("Content-Disposition", "inline; filename=resume.pdf");
        return File(stream, "application/pdf");
    }
}
