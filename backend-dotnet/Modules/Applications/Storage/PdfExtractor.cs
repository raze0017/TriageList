using UglyToad.PdfPig;

namespace TriageList.Api.Modules.Applications.Storage;

public interface IPdfExtractor
{
    string ExtractText(Stream pdfStream);
}

public class PdfPigExtractor : IPdfExtractor
{
    public string ExtractText(Stream pdfStream)
    {
        using var document = PdfDocument.Open(pdfStream);
        var textPages = new List<string>();

        foreach (var page in document.GetPages())
        {
            textPages.Add(page.Text);
        }

        return string.Join("\n", textPages);
    }
}
