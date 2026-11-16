using System.Text.Json.Serialization;

namespace TriageList.Api.Modules.Jd;

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

public record TriageApplicationItem(
    [property: JsonPropertyName("id")] Guid Id,
    [property: JsonPropertyName("applicant_name")] string ApplicantName,
    [property: JsonPropertyName("email")] string Email,
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("submitted_at")] DateTime SubmittedAt,
    [property: JsonPropertyName("signals")] CandidateSignalResponse? Signals
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
