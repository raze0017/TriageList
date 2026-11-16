namespace TriageList.Api.Common.Enums;

public enum ApplicationStatus
{
    Pending,
    Processing,
    Ready,
    Unprocessable
}

public enum JobApplicationStatus
{
    Pending,
    Scoring,
    Scored,
    Failed
}

public enum JdStatus
{
    Draft,
    Active,
    Closed
}

public enum ExperienceBand
{
    ZERO_TO_ONE,
    ONE_TO_THREE,
    THREE_TO_FIVE,
    FIVE_PLUS
}

public enum Level
{
    Low,
    Medium,
    High
}
