using System.Text.Json.Serialization;

namespace TriageList.Api.Modules.Applications;

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
    [property: JsonPropertyName("candidateSignal")] ApplicationCandidateSignalResponse? CandidateSignal
);

public record ApplicationCandidateSignalResponse(
    [property: JsonPropertyName("primarySkills")] List<string> PrimarySkills,
    [property: JsonPropertyName("experienceBand")] string ExperienceBand,
    [property: JsonPropertyName("domainAlignment")] string DomainAlignment,
    [property: JsonPropertyName("resumeCompleteness")] string ResumeCompleteness,
    [property: JsonPropertyName("ambiguityFlag")] bool AmbiguityFlag,
    [property: JsonPropertyName("jdMatchScore")] string JdMatchScore,
    [property: JsonPropertyName("extractedAt")] DateTime ExtractedAt
);
