using System.Buffers.Binary;
using System.Diagnostics;
using System.IO;
using System.IO.Pipes;
using System.Text;
using System.Text.Json.Nodes;

namespace AppUse;

internal static class NativeBridge
{
    public static async Task<int> Run(string pipe, string[] args)
    {
        var extension = (await File.ReadAllTextAsync(Path.Combine(AppContext.BaseDirectory, "extension-id.txt"))).Trim();
        if (args.Length < 1 || args[0] != "chrome-extension://" + extension + "/") throw new IOException("unapproved extension origin");
        using var connection = new NamedPipeClientStream(".", pipe, PipeDirection.InOut, PipeOptions.Asynchronous | PipeOptions.CurrentUserOnly);
        try { await connection.ConnectAsync(1000); }
        catch (TimeoutException)
        {
            Process.Start(new ProcessStartInfo(Environment.ProcessPath!) { ArgumentList = { "--serve" }, UseShellExecute = false, CreateNoWindow = true });
            await connection.ConnectAsync(8000);
        }
        using var cancel = new CancellationTokenSource();
        using var input = Console.OpenStandardInput();
        using var output = Console.OpenStandardOutput();
        using var reader = new StreamReader(connection, new UTF8Encoding(false), false, 65536, true);
        using var writer = new StreamWriter(connection, new UTF8Encoding(false), 65536, true) { AutoFlush = true };
        await writer.WriteLineAsync("{\"role\":\"extension\"}");
        var fromBrowser = Task.Run(async () =>
        {
            var header = new byte[4];
            while (!cancel.IsCancellationRequested)
            {
                await input.ReadExactlyAsync(header, cancel.Token);
                var length = BinaryPrimitives.ReadInt32LittleEndian(header);
                if (length is < 2 or > 1_048_576) throw new IOException("invalid native frame length");
                var body = new byte[length]; await input.ReadExactlyAsync(body, cancel.Token);
                var line = Encoding.UTF8.GetString(body);
                var message = JsonNode.Parse(line)!.AsObject();
                if (message.ContainsKey("role")) throw new IOException("invalid native reply");
                await writer.WriteLineAsync(message.ToJsonString());
            }
        });
        var toBrowser = Task.Run(async () =>
        {
            while (await reader.ReadLineAsync(cancel.Token) is { } line)
            {
                var data = Encoding.UTF8.GetBytes(line);
                if (data.Length > 1_048_576) throw new IOException("native frame exceeds 1 MiB");
                var header = new byte[4]; BinaryPrimitives.WriteInt32LittleEndian(header, data.Length);
                await output.WriteAsync(header, cancel.Token); await output.WriteAsync(data, cancel.Token); await output.FlushAsync(cancel.Token);
            }
        });
        try { await await Task.WhenAny(fromBrowser, toBrowser); }
        finally { cancel.Cancel(); }
        return 0;
    }
}
