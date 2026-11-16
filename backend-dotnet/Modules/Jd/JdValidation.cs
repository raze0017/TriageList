using FluentValidation;

namespace TriageList.Api.Modules.Jd;

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
