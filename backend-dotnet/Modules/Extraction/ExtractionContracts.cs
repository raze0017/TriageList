using System.Text.Json.Serialization;

namespace TriageList.Api.Modules.Extraction;

public record GeminiExtractionOutput
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
