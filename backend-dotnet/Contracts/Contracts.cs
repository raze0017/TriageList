using System.Text.Json.Serialization;
using TriageList.Api.Domain.Enums;

namespace TriageList.Api.Contracts;

// --- JD DTOs ---
public record CreateJdRequest(
    [property: JsonPropertyName("title")] string Title,
    [property: JsonPropertyName("raw_jd_text")] string RawJdText
);

public record JdResponse(
    [property: JsonPropertyName("id")] Guid Id,
    [property: JsonPropertyName("title")] string Title,
    [property: JsonPropertyName("created_at")] DateTime CreatedAt
);

public record ListJdsQuery(
    string? Search,
    int Page = 1,
    int PageSize = 20,
    string SortBy = "createdAt",
    string Order = "desc"
);

public record PagedResult<T>(
    [property: JsonPropertyName("items")] IReadOnlyList<T> Items,
    [property: JsonPropertyName("meta")] PagedMeta Meta
);

public record PagedMeta(
    [property: JsonPropertyName("page")] int Page,
    [property: JsonPropertyName("pageSize")] int PageSize,
    [property: JsonPropertyName("total")] int Total
);

// --- Application DTOs ---
public class CreateApplicationForm
{
    public Guid JdId { get; set; }
    public string ApplicantName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public IFormFile File { get; set; } = null!;
}

public record ApplicationCreatedResponse(
    [property: JsonPropertyName("id")] Guid Id,
    [property: JsonPropertyName("status")] string Status
);

public record ApplicationDetailResponse(
    [property: JsonPropertyName("id")] Guid Id,
    [property: JsonPropertyName("applicantName")] string ApplicantName,
    [property: JsonPropertyName("email")] string Email,
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("submittedAt")] DateTime SubmittedAt,
    [property: JsonPropertyName("candidateSignal")] CandidateSignalResponse? CandidateSignal
);

public record CandidateSignalResponse(
    [property: JsonPropertyName("primarySkills")] List<string> PrimarySkills,
    [property: JsonPropertyName("experienceBand")] string ExperienceBand,
    [property: JsonPropertyName("domainAlignment")] string DomainAlignment,
    [property: JsonPropertyName("resumeCompleteness")] string ResumeCompleteness,
    [property: JsonPropertyName("ambiguityFlag")] bool AmbiguityFlag,
    [property: JsonPropertyName("jdMatchScore")] string JdMatchScore,
    [property: JsonPropertyName("extractedAt")] DateTime ExtractedAt
);

// --- Triage List DTOs ---
public record TriageApplicationItem(
    [property: JsonPropertyName("id")] Guid Id,
    [property: JsonPropertyName("applicant_name")] string ApplicantName,
    [property: JsonPropertyName("email")] string Email,
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("submitted_at")] DateTime SubmittedAt,
    [property: JsonPropertyName("signals")] CandidateSignalResponse? Signals
);

// --- AI Extraction DTO ---
public class GeminiExtractionOutput
{
    [JsonPropertyName("primarySkills")]
    public List<string> PrimarySkills { get; set; } = new();

    [JsonPropertyName("experienceBand")]
    public string ExperienceBand { get; set; } = string.Empty;

    [JsonPropertyName("domainAlignment")]
    public string DomainAlignment { get; set; } = string.Empty;

    [JsonPropertyName("resumeCompleteness")]
    public string ResumeCompleteness { get; set; } = string.Empty;

    [JsonPropertyName("ambiguityFlag")]
    public bool AmbiguityFlag { get; set; }

    [JsonPropertyName("jdMatchScore")]
    public string JdMatchScore { get; set; } = string.Empty;
}
