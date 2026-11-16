using System.Text.Json;
using TriageList.Api.Common.Enums;

namespace TriageList.Api.Common.Entities;

public class JdVersion
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string RawJdText { get; set; } = string.Empty;
    public string? Requirements { get; set; }
    public JdStatus Status { get; set; } = JdStatus.Draft;
    public string CreatedBy { get; set; } = "system";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<JobApplication> JobApplications { get; set; } = new List<JobApplication>();
}

public class Application
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ApplicantName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public JsonDocument? RawText { get; set; }
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    public CandidateSignal? CandidateSignal { get; set; }
    public ICollection<JobApplication> JobApplications { get; set; } = new List<JobApplication>();
}

public class JobApplication
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid JdId { get; set; }
    public Guid ApplicationId { get; set; }
    public JobApplicationStatus Status { get; set; } = JobApplicationStatus.Pending;

    public int? MatchScore { get; set; }
    public List<string> Reasoning { get; set; } = new();
    public JsonDocument? AttributeScores { get; set; }
    public DateTime? ScoredAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public JdVersion JdVersion { get; set; } = null!;
    public Application Application { get; set; } = null!;
}

public class CandidateSignal
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ApplicationId { get; set; }
    public List<string> PrimarySkills { get; set; } = new();
    public ExperienceBand ExperienceBand { get; set; }
    public Level DomainAlignment { get; set; }
    public Level ResumeCompleteness { get; set; }
    public bool AmbiguityFlag { get; set; } = false;
    public Level JdMatchScore { get; set; }
    public DateTime ExtractedAt { get; set; } = DateTime.UtcNow;

    public Application Application { get; set; } = null!;
}
