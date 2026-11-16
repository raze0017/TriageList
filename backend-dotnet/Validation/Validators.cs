using FluentValidation;
using TriageList.Api.Contracts;

namespace TriageList.Api.Validation;

public class CreateJdRequestValidator : AbstractValidator<CreateJdRequest>
{
    public CreateJdRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MinimumLength(2).WithMessage("Title must be at least 2 characters.")
            .MaximumLength(120).WithMessage("Title must not exceed 120 characters.");

        RuleFor(x => x.RawJdText)
            .NotEmpty().WithMessage("raw_jd_text is required.")
            .MinimumLength(30).WithMessage("raw_jd_text must be at least 30 characters.")
            .MaximumLength(30000).WithMessage("raw_jd_text must not exceed 30,000 characters.");
    }
}

public class CreateApplicationFormValidator : AbstractValidator<CreateApplicationForm>
{
    public CreateApplicationFormValidator()
    {
        RuleFor(x => x.JdId)
            .NotEmpty().WithMessage("jd_id is required.");

        RuleFor(x => x.ApplicantName)
            .NotEmpty().WithMessage("applicant_name is required.")
            .Length(2, 100).WithMessage("applicant_name must be between 2 and 100 characters.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("email is required.")
            .EmailAddress().WithMessage("Invalid email format.");

        RuleFor(x => x.File)
            .NotNull().WithMessage("Resume PDF file is required.")
            .Must(f => f != null && f.ContentType == "application/pdf").WithMessage("Only PDF files are allowed.")
            .Must(f => f != null && f.Length <= 10 * 1024 * 1024).WithMessage("File size cannot exceed 10MB.");
    }
}
