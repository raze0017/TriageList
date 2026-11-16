using Microsoft.EntityFrameworkCore;
using TriageList.Api.Domain.Entities;
using TriageList.Api.Domain.Enums;

namespace TriageList.Api.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<JdVersion> JdVersions => Set<JdVersion>();
    public DbSet<Application> Applications => Set<Application>();
    public DbSet<JobApplication> JobApplications => Set<JobApplication>();
    public DbSet<CandidateSignal> CandidateSignals => Set<CandidateSignal>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Map PostgreSQL enum types to match existing Prisma schema
        modelBuilder.HasPostgresEnum<ApplicationStatus>("ApplicationStatus");
        modelBuilder.HasPostgresEnum<JobApplicationStatus>("JobApplicationStatus");
        modelBuilder.HasPostgresEnum<JdStatus>("JdStatus");
        modelBuilder.HasPostgresEnum<ExperienceBand>("ExperienceBand");
        modelBuilder.HasPostgresEnum<Level>("Level");

        // JdVersion
        modelBuilder.Entity<JdVersion>(b =>
        {
            b.ToTable("jd_versions");
            b.HasKey(x => x.Id);
            b.Property(x => x.Title).IsRequired().HasMaxLength(120);
            b.Property(x => x.RawJdText).IsRequired();
            b.HasIndex(x => x.Status);
        });

        // Application
        modelBuilder.Entity<Application>(b =>
        {
            b.ToTable("applications");
            b.HasKey(x => x.Id);
            b.Property(x => x.ApplicantName).IsRequired().HasMaxLength(100);
            b.Property(x => x.Email).IsRequired();
            b.Property(x => x.FilePath).IsRequired();
            b.Property(x => x.RawText).HasColumnType("jsonb");
            b.HasIndex(x => x.Status);
            b.HasIndex(x => x.Email);
        });

        // JobApplication
        modelBuilder.Entity<JobApplication>(b =>
        {
            b.ToTable("job_applications");
            b.HasKey(x => x.Id);
            b.HasIndex(x => new { x.JdId, x.ApplicationId }).IsUnique();
            b.Property(x => x.AttributeScores).HasColumnType("jsonb");
            b.Property(x => x.Reasoning).HasColumnType("text[]");

            b.HasOne(x => x.JdVersion)
                .WithMany(x => x.JobApplications)
                .HasForeignKey(x => x.JdId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(x => x.Application)
                .WithMany(x => x.JobApplications)
                .HasForeignKey(x => x.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // CandidateSignal
        modelBuilder.Entity<CandidateSignal>(b =>
        {
            b.ToTable("candidate_signals");
            b.HasKey(x => x.Id);
            b.HasIndex(x => x.ApplicationId).IsUnique();
            b.Property(x => x.PrimarySkills).HasColumnType("text[]");

            b.HasOne(x => x.Application)
                .WithOne(x => x.CandidateSignal)
                .HasForeignKey<CandidateSignal>(x => x.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
