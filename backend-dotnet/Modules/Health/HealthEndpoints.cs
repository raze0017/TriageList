namespace TriageList.Api.Modules.Health;

public static class HealthEndpoints
{
    public static void MapHealthEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/v1/health", () => Results.Ok(new 
        { 
            status = "healthy", 
            timestamp = DateTime.UtcNow 
        }))
        .WithName("GetHealth")
        .WithTags("Health");
    }
}
