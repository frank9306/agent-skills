using System.Collections.Concurrent;
using System.IO;
using System.IO.Pipes;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace AppUse;

internal sealed class Broker(string pipe)
{
    internal static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    readonly ConcurrentDictionary<string, Link> links = new();
    readonly ConcurrentDictionary<string, Desktop> desktops = new();
    readonly ConcurrentDictionary<string, string> browserSessions = new();
    readonly SemaphoreSlim desktopGate = new(1);
    public async Task Run()
    {
        using var singleton = new Mutex(true, pipe + "-broker", out var created);
        if (!created) return;
        while (true)
        {
            var server = new NamedPipeServerStream(pipe, PipeDirection.InOut, 32, PipeTransmissionMode.Byte,
                PipeOptions.Asynchronous | PipeOptions.CurrentUserOnly);
            await server.WaitForConnectionAsync();
            _ = Accept(server);
        }
    }
    async Task Accept(NamedPipeServerStream stream)
    {
        using (stream)
        using (var reader = new StreamReader(stream, new UTF8Encoding(false), false, 65536, true))
        using (var writer = new StreamWriter(stream, new UTF8Encoding(false), 65536, true) { AutoFlush = true })
        {
            Link? link = null;
            try
            {
                while (await reader.ReadLineAsync() is { } line)
                {
                    if (line.Length > 2_000_000) throw new IOException("message too large");
                    var message = JsonNode.Parse(line)!.AsObject();
                    if (message["role"]?.GetValue<string>() == "extension")
                    {
                        if (link is not null) throw new IOException("duplicate handshake");
                        var id = Guid.NewGuid().ToString("N");
                        link = new Link(writer); links[id] = link;
                        link.Id = id;
                        await writer.WriteLineAsync(new JsonObject { ["connected"] = id }.ToJsonString());
                    }
                    else if (link is not null && message["nativeRequest"] is { } nativeId)
                    {
                        var owner = link;
                        _ = Task.Run(() => NativeFocusReply(owner, nativeId.GetValue<string>(), message));
                    }
                    else if (link is not null) link.Complete(message);
                    else
                    {
                        var id = message["id"]?.GetValue<string>();
                        JsonObject reply;
                        try { reply = new() { ["id"] = id, ["result"] = await Dispatch(message["method"]!.GetValue<string>(), message["params"]?.AsObject() ?? new()) }; }
                        catch (Exception e) { reply = new() { ["id"] = id, ["error"] = e.Message }; }
                        await writer.WriteLineAsync(reply.ToJsonString());
                    }
                }
            }
            catch (Exception e) { Console.Error.WriteLine(e.Message); }
            finally
            {
                if (link is not null)
                {
                    links.TryRemove(link.Id, out _); link.Disconnect();
                    foreach (var pair in browserSessions.Where(p => p.Value == link.Id)) browserSessions.TryRemove(pair.Key, out _);
                }
            }
        }
    }
    async Task NativeFocusReply(Link link, string id, JsonObject message)
    {
        JsonObject reply;
        try {
            if (message["method"]?.GetValue<string>() != "activate-browser") throw new IOException("unsupported native browser operation");
            var p = message["params"]!.AsObject();
            var session = p["session"]!.GetValue<string>();
            var expiry = p["expiresAt"]!.GetValue<long>();
            void Guard() {
                if (DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() >= expiry) throw new IOException("native activation expired");
                if (!links.ContainsKey(link.Id) || !browserSessions.TryGetValue(session, out var owner) || owner != link.Id)
                    throw new IOException("native activation session stopped or outside connection scope");
            }
            await desktopGate.WaitAsync();
            try { Guard(); reply = new JsonObject { ["nativeReply"] = id, ["result"] = Foreground.ActivateBrowser(p["marker"]!.GetValue<string>(), Guard) }; }
            finally { desktopGate.Release(); }
        }
        catch (Exception e) { reply = new JsonObject { ["nativeReply"] = id, ["error"] = e.Message }; }
        try { await link.Send(reply); } catch { /* Disconnect already invalidates this connection's sessions. */ }
    }
    async Task<JsonNode?> Dispatch(string method, JsonObject p)
    {
        if (method == "doctor") return JsonSerializer.SerializeToNode(new { version = "0.1.0", pipe, extensions = links.Keys.ToArray(), userScoped = true }, Json);
        if (method == "sessions")
        {
            var result = new JsonArray();
            foreach (var d in desktops)
            {
                try { result.Add(d.Value.Identity()); }
                catch { desktops.TryRemove(d.Key, out _); }
            }
            foreach (var l in links.Values)
            {
                try
                {
                    var tabs = (await l.Call("sessions", p))!.AsArray();
                    foreach (var tab in tabs) { var item = tab!.DeepClone().AsObject(); item["connection"] = l.Id; result.Add(item); }
                }
                catch (Exception e) { result.Add(new JsonObject { ["connection"] = l.Id, ["error"] = e.Message }); }
            }
            if (p["discoverDesktop"]?.GetValue<bool>() == true) foreach (var w in Desktop.Windows()) result.Add(w);
            return result;
        }
        if (method == "prepare" && p["kind"]?.GetValue<string>() == "desktop")
        {
            var d = new Desktop(p); desktops[d.Id] = d; return d.Identity();
        }
        if (method == "prepare" && p["kind"]?.GetValue<string>() == "browser")
        {
            var connection = p["connection"]?.GetValue<string>() ?? throw new IOException("select a connection from sessions");
            if (!links.TryGetValue(connection, out var l)) throw new IOException("browser disconnected");
            var result = (await l.Call(method, p))!.AsObject();
            browserSessions[result["session"]!.GetValue<string>()] = connection; return result;
        }
        var session = p["session"]?.GetValue<string>() ?? throw new IOException("session required");
        if (desktops.TryGetValue(session, out var desktop))
        {
            if (method == "stop") { desktop.Stopped = true; desktops.TryRemove(session, out _); return new JsonObject { ["stopped"] = true }; }
            await desktopGate.WaitAsync();
            try
            {
                // Visual attempts consume their token inside the owner before its expiry guard.
                if (method != "visual-click" && p["expiresAt"] is { } expiry && DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() >= expiry.GetValue<long>()) throw new IOException("request expired before dispatch");
                return desktop.Execute(method, p);
            }
            finally { desktopGate.Release(); }
        }
        if (browserSessions.TryGetValue(session, out var c) && links.TryGetValue(c, out var link))
        {
            // Stop invalidates an in-flight native activation before waiting on the extension.
            if (method == "stop") browserSessions.TryRemove(session, out _);
            var result = await link.Call(method, p);
            return result;
        }
        throw new IOException("session unavailable or disconnected; prepare again");
    }
    sealed class Link(StreamWriter writer)
    {
        public string Id = "";
        readonly SemaphoreSlim writes = new(1);
        readonly ConcurrentDictionary<string, TaskCompletionSource<JsonNode?>> pending = new();
        public async Task<JsonNode?> Call(string method, JsonObject p)
        {
            var id = Guid.NewGuid().ToString("N");
            var completion = new TaskCompletionSource<JsonNode?>(TaskCreationOptions.RunContinuationsAsynchronously);
            pending[id] = completion;
            try
            {
                await Send(new JsonObject { ["id"] = id, ["method"] = method, ["params"] = p.DeepClone() });
                return await completion.Task.WaitAsync(TimeSpan.FromSeconds(15));
            }
            finally { pending.TryRemove(id, out _); }
        }
        public async Task Send(JsonObject message)
        {
            await writes.WaitAsync();
            try { await writer.WriteLineAsync(message.ToJsonString()); }
            finally { writes.Release(); }
        }
        public void Complete(JsonObject message)
        {
            var id = message["id"]?.GetValue<string>();
            if (id is not null && pending.TryRemove(id, out var t))
            {
                if (message["error"] is { } error) t.TrySetException(new IOException(error.GetValue<string>()));
                else t.TrySetResult(message["result"]?.DeepClone());
            }
        }
        public void Disconnect() { foreach (var t in pending.Values) t.TrySetException(new IOException("browser disconnected")); }
    }
}
