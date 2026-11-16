using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TriageList.Api.Contracts;
using TriageList.Api.Domain.Entities;
using TriageList.Api.Infrastructure.Data;

namespace TriageList.Api.Controllers;

[ApiController]
[Route("api/v1/jds")]
public class JdsController : ControllerBase
{
    private readonly AppDbContext _db;

    public JdsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateJdRequest request, CancellationToken ct)
    {
        var jd = new JdVersion
        {
            Title = request.Title.Trim(),
            RawJdText = request.RawJdText.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _db.JdVersions.Add(jd);
        await _db.SaveChangesAsync(ct);

        return StatusCode(201, new
        {
            data = new JdResponse(jd.Id, jd.Title, jd.CreatedAt),
            requestId = HttpContext.TraceIdentifier
        });
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] ListJdsQuery query, CancellationToken ct)
    {
        var dbQuery = _db.JdVersions.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            dbQuery = dbQuery.Where(j => j.Title.ToLower().Contains(search) || j.RawJdText.ToLower().Contains(search));
        }

        var total = await dbQuery.CountAsync(ct);

        dbQuery = query.SortBy.ToLower() switch
        {
            "title" => query.Order.ToLower() == "asc" ? dbQuery.OrderBy(j => j.Title) : dbQuery.OrderByDescending(j => j.Title),
            _ => query.Order.ToLower() == "asc" ? dbQuery.OrderBy(j => j.CreatedAt) : dbQuery.OrderByDescending(j => j.CreatedAt)
        };

        var skip = (query.Page - 1) * query.PageSize;
        var items = await dbQuery
            .Skip(skip)
            .Take(query.PageSize)
            .Select(j => new JdResponse(j.Id, j.Title, j.CreatedAt))
            .ToListAsync(ct);

        return Ok(new
        {
            data = new PagedResult<JdResponse>(items, new PagedMeta(query.Page, query.PageSize, total)),
            requestId = HttpContext.TraceIdentifier
        });
    }

    [HttpGet("{jdId}/applications")]
    public async Task<IActionResult> GetTriageList(
        Guid jdId,
        [FromQuery] string? experienceBand,
        [FromQuery] string? domainAlignment,
        [FromQuery] string? jdMatchScore,
        [FromQuery] string? status,
        [FromQuery] string sortBy = "jd_match_score",
        [FromQuery] string order = "desc",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var baseQuery = _db.JobApplications
            .AsNoTracking()
            .Where(ja => ja.JdId == jdId)
            .Include(ja => ja.Application)
                .ThenInclude(a => a.CandidateSignal)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            baseQuery = baseQuery.Where(ja => ja.Application.Status.ToString().ToLower() == status.ToLower());
        }

        var total = await baseQuery.CountAsync(ct);

        var skip = (page - 1) * pageSize;
        var results = await baseQuery
            .Skip(skip)
            .Take(pageSize)
            .Select(ja => new TriageApplicationItem(
                ja.Application.Id,
                ja.Application.ApplicantName,
                ja.Application.Email,
                ja.Application.Status.ToString().ToLower(),
                ja.Application.SubmittedAt,
                ja.Application.CandidateSignal == null ? null : new CandidateSignalResponse(
                    ja.Application.CandidateSignal.PrimarySkills,
                    ja.Application.CandidateSignal.ExperienceBand.ToString(),
                    ja.Application.CandidateSignal.DomainAlignment.ToString().ToLower(),
                    ja.Application.CandidateSignal.ResumeCompleteness.ToString().ToLower(),
                    ja.Application.CandidateSignal.AmbiguityFlag,
                    ja.Application.CandidateSignal.JdMatchScore.ToString().ToLower(),
                    ja.Application.CandidateSignal.ExtractedAt
                )
            ))
            .ToListAsync(ct);

        return Ok(new
        {
            data = new PagedResult<TriageApplicationItem>(results, new PagedMeta(page, pageSize, total)),
            requestId = HttpContext.TraceIdentifier
        });
    }
}
