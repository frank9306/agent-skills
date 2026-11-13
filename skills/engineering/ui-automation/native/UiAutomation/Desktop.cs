using System.Diagnostics;
using System.Drawing;
using System.Globalization;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace UiAutomation;

internal sealed partial class Desktop
{
    public string Id { get; } = Guid.NewGuid().ToString("N");
    public volatile bool Stopped;
    readonly nint hwnd;
    readonly int pid;
    readonly long started;
    bool capturePaused;

    public Desktop(JsonObject p)
    {
        hwnd = (nint)long.Parse(p["hwnd"]!.ToString(), CultureInfo.InvariantCulture);
        GetWindowThreadProcessId(hwnd, out var actual);
        pid = p["pid"]!.GetValue<int>();
        if (pid != actual || !IsWindow(hwnd) || !IsWindowVisible(hwnd)) throw new IOException("window identity mismatch");
        using var process = Process.GetProcessById(pid);
        started = process.StartTime.ToUniversalTime().Ticks;
    }

    void Alive()
    {
        GetWindowThreadProcessId(hwnd, out var actual);
        if (!IsWindow(hwnd) || actual != pid) throw new IOException("target window expired");
        using var process = Process.GetProcessById(pid);
        if (process.StartTime.ToUniversalTime().Ticks != started) throw new IOException("target process expired");
    }

    static string Title(nint window)
    {
        var title = new StringBuilder(512);
        GetWindowText(window, title, title.Capacity);
        return title.ToString();
    }

    public JsonObject Identity()
    {
        Alive();
        using var process = Process.GetProcessById(pid);
        string? version = null;
        try { version = process.MainModule?.FileVersionInfo.FileVersion; } catch { }
        return JsonSerializer.SerializeToNode(new { session = Id, kind = "desktop", hwnd = (long)hwnd, pid, started, title = Title(hwnd), version, dpi = GetDpiForWindow(hwnd) }, Broker.Json)!.AsObject();
    }

    public static IEnumerable<JsonObject> Windows()
    {
        var results = new List<JsonObject>();
        EnumWindows((window, _) =>
        {
            if (!IsWindowVisible(window)) return true;
            var title = Title(window);
            if (title.Length == 0) return true;
            GetWindowThreadProcessId(window, out var pid);
            results.Add(new JsonObject { ["kind"] = "desktop", ["hwnd"] = (long)window, ["pid"] = pid, ["title"] = title });
            return true;
        }, 0);
        return results;
    }

    public JsonNode Execute(string method, JsonObject p)
    {
        using var inputLock = new Mutex(false, @"Local\UiAutomation-input-" + System.Security.Principal.WindowsIdentity.GetCurrent().User!.Value);
        try { if (!inputLock.WaitOne(5000)) throw new IOException("desktop input busy"); }
        catch (AbandonedMutexException) { /* The current thread now owns the mutex. */ }
        try { return ExecuteLocked(method, p); }
        finally { inputLock.ReleaseMutex(); }
    }

    JsonNode ExecuteLocked(string method, JsonObject p)
    {
        void Guard()
        {
            if (Stopped) throw new IOException("session stopped");
            if (p["expiresAt"] is { } expiry && DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() >= expiry.GetValue<long>())
                throw new IOException("request expired before dispatch");
            Alive();
        }

        Guard();
        var prior = visual;
        visual = null;
        if (method == "visual-observe") return VisualObserve();
        if (method == "visual-crop") return VisualCrop(p, prior);
        if (method == "visual-click") return VisualClick(p, prior, Guard);
        if (method == "visual-batch") return VisualBatch(p, prior, Guard);
        if (method == "visual-baseline") return VisualBaseline();
        if (method == "visual-change") return VisualChange(p, prior);
        if (method == "act" && p["action"] is JsonObject action)
        {
            switch (action["type"]?.GetValue<string>())
            {
                case "focus":
                    var foreground = Foreground.Activate(hwnd, Guard);
                    return new JsonObject { ["actionExecuted"] = true, ["goalVerified"] = false, ["diagnostics"] = new JsonObject { ["foreground"] = foreground } };
                case "resume-capture" when action["userConfirmed"]?.GetValue<bool>() == true:
                    capturePaused = false;
                    return new JsonObject { ["actionExecuted"] = true, ["goalVerified"] = false };
            }
        }
        throw new IOException("unsupported desktop operation; use a fresh screenshot");
    }

    static void SendKey(ushort key, bool up, ushort scan = 0, uint flags = 0)
    {
        var input = new INPUT { type = 1, data = new UNION { keyboard = new KEYBDINPUT { vk = key, scan = scan, flags = flags | (up ? 2u : 0u) } } };
        if (SendInput(1, [input], Marshal.SizeOf<INPUT>()) != 1) throw new IOException("keyboard input rejected");
    }

    static void SendText(ReadOnlySpan<char> text)
    {
        var events = new INPUT[text.Length * 2];
        for (var i = 0; i < text.Length; i++)
        {
            events[i * 2] = new INPUT { type = 1, data = new UNION { keyboard = new KEYBDINPUT { scan = text[i], flags = 4 } } };
            events[i * 2 + 1] = new INPUT { type = 1, data = new UNION { keyboard = new KEYBDINPUT { scan = text[i], flags = 6 } } };
        }
        var sent = SendInput((uint)events.Length, events, Marshal.SizeOf<INPUT>());
        if (sent == events.Length) return;
        if (sent % 2 == 1) SendKey(0, true, text[(int)sent / 2], 4);
        throw new IOException("keyboard input was incomplete; inspect the current screen");
    }

    static void Mouse(uint flags)
    {
        var input = new INPUT { type = 0, data = new UNION { mouse = new MOUSEINPUT { flags = flags } } };
        if (SendInput(1, [input], Marshal.SizeOf<INPUT>()) != 1) throw new IOException("pointer input rejected");
    }

    [StructLayout(LayoutKind.Sequential)] struct INPUT { public uint type; public UNION data; }
    [StructLayout(LayoutKind.Explicit)] struct UNION { [FieldOffset(0)] public MOUSEINPUT mouse; [FieldOffset(0)] public KEYBDINPUT keyboard; }
    [StructLayout(LayoutKind.Sequential)] struct MOUSEINPUT { public int x, y; public uint data, flags, time; public nuint extra; }
    [StructLayout(LayoutKind.Sequential)] struct KEYBDINPUT { public ushort vk, scan; public uint flags, time; public nuint extra; }
    [StructLayout(LayoutKind.Sequential)] struct RECT { public int left, top, right, bottom; }
    [StructLayout(LayoutKind.Sequential)]
    struct GUITHREADINFO { public uint size, flags; public nint active, focus, capture, menu, moveSize, caret; public RECT caretRect; }
    delegate bool EnumWindowCallback(nint window, nint extra);
    [DllImport("user32.dll")] static extern bool EnumWindows(EnumWindowCallback callback, nint extra);
    [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(nint window, out int pid);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int GetWindowText(nint window, StringBuilder title, int capacity);
    [DllImport("user32.dll")] static extern bool IsWindow(nint window);
    [DllImport("user32.dll")] static extern bool IsWindowVisible(nint window);
    [DllImport("user32.dll")] static extern bool GetWindowRect(nint window, out RECT rect);
    [DllImport("user32.dll")] static extern uint GetDpiForWindow(nint window);
    [DllImport("user32.dll")] static extern nint GetForegroundWindow();
    [DllImport("user32.dll")] static extern bool GetGUIThreadInfo(uint thread, ref GUITHREADINFO info);
    [DllImport("user32.dll")] static extern bool SetCursorPos(int x, int y);
    [DllImport("user32.dll")] static extern bool GetCursorPos(out Point point);
    [DllImport("user32.dll")] static extern nint WindowFromPoint(Point point);
    [DllImport("user32.dll")] static extern nint GetAncestor(nint window, uint flags);
    [DllImport("user32.dll")] static extern uint SendInput(uint count, INPUT[] inputs, int size);
}
