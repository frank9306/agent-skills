using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Laya;
using Laya.Tokenization;

Console.InputEncoding = Encoding.UTF8;
Console.OutputEncoding = new UTF8Encoding(false);
var json = new JsonSerializerOptions(JsonSerializerDefaults.Web);
if (args.Length != 1) { Console.Error.WriteLine("Usage: LayaWorker <model-directory>"); return 2; }
try
{
    var directory = Path.GetFullPath(args[0]);
    using (var manifest = JsonDocument.Parse(await File.ReadAllTextAsync(Path.Combine(directory, "manifest.json"))))
    {
        var root = manifest.RootElement;
        using var fixedStream = System.Reflection.Assembly.GetExecutingAssembly().GetManifestResourceStream("fixed-model.json")!;
        using var fixedManifest = JsonDocument.Parse(fixedStream);
        if (root.GetProperty("sourceRepository").GetString() != "convaiinnovations/laya-multilingual"
            || root.GetProperty("sourceRevision").GetString() != "1720e3e3357cfe1e281542e223f8273b0890ca34"
            || root.GetProperty("checkpointSha256").GetString() != "9d628fd971b700382ac6f65920a86f149777b2e748e0c955fb3b19695aa8f204"
            || root.GetProperty("exporterRevision").GetString() != "6f0496f797dc7127265d62e1543a62de507d943c") throw new IOException("fixed model provenance mismatch");
        foreach (var name in new[] { "model.onnx", "model.onnx.data", "rl_agent_config.json", "tokenizer/tokenizer.json", "tokenizer/tokenizer_config.json" })
        {
            using var stream = File.OpenRead(Path.Combine(directory, name));
            var expected = fixedManifest.RootElement.GetProperty("files").GetProperty(name).GetString();
            if (root.GetProperty("files").GetProperty(name).GetString() != expected || Convert.ToHexStringLower(SHA256.HashData(stream)) != expected) throw new IOException("fixed model hash mismatch: " + name);
        }
    }
    using var engine = LayaEngine.Create(new LayaOptions { ModelDirectory = directory, AllowDownload = false, IntraOpThreads = 2, InterOpThreads = 1 });
    using var tokenizer = new HfTokenizer(engine.Artifacts.TokenizerPath);
    while (await Console.In.ReadLineAsync() is { } line)
    {
        Reply reply;
        try
        {
            if (line.Length > 100000) throw new IOException("model request too large");
            var request = JsonSerializer.Deserialize<Request>(line, json) ?? throw new IOException("request required");
            if (string.IsNullOrWhiteSpace(request.State) || string.IsNullOrWhiteSpace(request.Question) || request.Options is not { Length: >= 2 and <= 12 }
                || request.Options.Select(o => o.Id).Distinct().Count() != request.Options.Length || request.Options.Any(o => string.IsNullOrWhiteSpace(o.Id) || string.IsNullOrWhiteSpace(o.Meaning))) throw new IOException("complete state/question/candidates required");
            if (new[] { request.State, request.Question }.Concat(request.Options.Select(o => o.Meaning)).Any(s => s.Contains(tokenizer.MaskToken, StringComparison.Ordinal))) throw new IOException("reserved tokenizer marker");
            var question = Question.Choice(request.Question, request.Options.Select(o => new KeyValuePair<string, object?>(o.Id, o.Meaning)));
            var tokens = SequenceBuilder.RenderOptions(question).Select(o => tokenizer.Encode(" " + o)).ToArray();
            var optionBudget = tokens.Sum(t => t.Length + 1);
            if (tokens.Any(t => t.Length > 48) || optionBudget > engine.Config.HeadMaxLen - 16 || tokenizer.Encode("choice question: " + request.Question).Length + optionBudget > engine.Config.HeadMaxLen) throw new IOException("question/candidates exceed complete model budget; no truncation");
            if (tokens.Select(t => string.Join(',', t)).Distinct().Count() != request.Options.Length) throw new IOException("candidate token collapse");
            var (empty, markers) = SequenceBuilder.Build(tokenizer, "", question, engine.Config.MaxLen, engine.Config.HeadMaxLen);
            if (markers.Length != request.Options.Length || empty.Length + tokenizer.Encode(request.State).Length > engine.Config.MaxLen) throw new IOException("observation exceeds complete context; no truncation");
            var prediction = engine.PredictLong(request.State, new QuestionSet { ["decision"] = question }, window: engine.Config.MaxLen);
            if (prediction.Usage.Windows != 1 || prediction.Usage.StateTokensDropped is > 0 || prediction.Usage.Truncated is > 0 || prediction.Usage.TruncatedQuestions is { Count: > 0 } || (prediction.Usage.Options?.Values.Any(o => o.Distinct != o.Total) ?? false)) throw new IOException("model did not read complete input");
            var answer = prediction["decision"].AsChoice();
            reply = new(answer.Choice, answer.Probabilities.ToDictionary(p => p.Key, p => p.Value));
        }
        catch (Exception e) { reply = new("", [], e.Message); }
        Console.WriteLine(JsonSerializer.Serialize(reply, json));
    }
    return 0;
}
catch (Exception e) { Console.Error.WriteLine(e.Message); return 1; }

record Candidate(string Id, string Meaning);
record Request(string State, string Question, Candidate[] Options);
record Reply(string Choice, Dictionary<string, double> Probabilities, string? Error = null);
