using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TriageList.Api.Common.Data;
using TriageList.Api.Common.Entities;
using TriageList.Api.Common.Enums;

namespace TriageList.Api.Modules.Extraction;

public interface ISignalExtractionService
{
    Task ExtractSignalsAsync(Guid applicationId, Guid jdId, CancellationToken cancellationToken = default);
}

public class SignalExtractionService : ISignalExtractionService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly HttpClient _httpClient;
    private readonly ILogger<SignalExtractionService> _logger;

    private const string PromptTemplate = """
    You are an expert HR recruitment assistant. Your job is to strictly extract exactly 6 candidate signals from a resume when compared to a specific job description (JD).

    You MUST ONLY return a valid, raw JSON object matching the described schema. Do NOT include markdown blocks, natural language explanations, or any other text outside the JSON.

    SCHEMA DEFINITION:
    {
      "primarySkills": ["string", ...], // List of technical and domain skills
      "experienceBand": "ZERO_TO_ONE" | "ONE_TO_THREE" | "THREE_TO_FIVE" | "FIVE_PLUS",
      "domainAlignment": "low" | "medium" | "high",
      "resumeCompleteness": "low" | "medium" | "high",
      "ambiguityFlag": boolean, // true if the resume is unclear, missing critical info, or vague
      "jdMatchScore": "low" | "medium" | "high" // overall match with the JD requirements
    }

    ---
    JOB DESCRIPTION:
    {{JD_TEXT}}

    ---
    RESUME TEXT:
    {{RESUME_TEXT}}
    ---

    Analyze the resume against the job description and return the JSON object:
    """;

    public SignalExtractionService(
        AppDbContext db,
        IConfiguration config,
        HttpClient httpClient,
        ILogger<SignalExtractionService> logger)
    {
        _db = db;
        _config = config;
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task ExtractSignalsAsync(Guid applicationId, Guid jdId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting ExtractSignals for Application: {ApplicationId}", applicationId);

        var application = await _db.Applications.FindAsync(new object[] { applicationId }, cancellationToken);
        var jd = await _db.JdVersions.FindAsync(new object[] { jdId }, cancellationToken);

        if (application == null || jd == null)
        {
            _logger.LogError("Application {ApplicationId} or JD {JdId} not found", applicationId, jdId);
            return;
        }

        // Set status to Processing
        application.Status = ApplicationStatus.Processing;
        await _db.SaveChangesAsync(cancellationToken);

        try
        {
            var rawTextJson = application.RawText?.RootElement.GetProperty("content").GetString() ?? "";
            var prompt = PromptTemplate
                .Replace("{{JD_TEXT}}", jd.RawJdText)
                .Replace("{{RESUME_TEXT}}", rawTextJson);

            var apiKey = _config["Gemini:ApiKey"];
            var model = _config["Gemini:Model"] ?? "gemini-2.5-flash";

            var endpoint = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        role = "user",
                        parts = new[] { new { text = prompt } }
                    }
                },
                generationConfig = new
                {
                    responseMimeType = "application/json"
                }
            };

            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(endpoint, content, cancellationToken);
            response.EnsureSuccessStatusCode();

            var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);
            using var doc = JsonDocument.Parse(responseJson);

            var textResponse = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            if (string.IsNullOrWhiteSpace(textResponse))
            {
                throw new InvalidOperationException("Gemini returned empty text content.");
            }

            var extraction = JsonSerializer.Deserialize<GeminiExtractionOutput>(textResponse, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }) ?? throw new InvalidOperationException("Failed to deserialize Gemini output.");

            // Parse enums
            Enum.TryParse<ExperienceBand>(extraction.ExperienceBand, true, out var expBand);
            Enum.TryParse<Level>(extraction.DomainAlignment, true, out var domainAlign);
            Enum.TryParse<Level>(extraction.ResumeCompleteness, true, out var completeness);
            Enum.TryParse<Level>(extraction.JdMatchScore, true, out var matchScore);

            var signal = new CandidateSignal
            {
                ApplicationId = application.Id,
                PrimarySkills = extraction.PrimarySkills,
                ExperienceBand = expBand,
                DomainAlignment = domainAlign,
                ResumeCompleteness = completeness,
                AmbiguityFlag = extraction.AmbiguityFlag,
                JdMatchScore = matchScore,
                ExtractedAt = DateTime.UtcNow
            };

            _db.CandidateSignals.Add(signal);
            application.Status = ApplicationStatus.Ready;
            await _db.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Successfully extracted signals for Application: {ApplicationId}", applicationId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during signal extraction for {ApplicationId}", applicationId);
            application.Status = ApplicationStatus.Unprocessable;
            await _db.SaveChangesAsync(cancellationToken);
            throw;
        }
    }
}
