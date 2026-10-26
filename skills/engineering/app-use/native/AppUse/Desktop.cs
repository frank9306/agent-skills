using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using System.Globalization;
using System.IO;
using System.Runtime.InteropServices;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Windows.Automation;

namespace AppUse;

internal sealed class Desktop
{
    public string Id { get; } = Guid.NewGuid().ToString("N");
    public volatile bool Stopped;
    readonly nint hwnd;
    readonly int pid;
    readonly long started;
    string observation = "";
    DateTime captured;
    Dictionary<string, AutomationElement> nodes = new();
    Dictionary<string, string> signatures = new();
    JsonObject? scope;
    readonly HashSet<string> secrets = [];
    AutomationElement Root => AutomationElement.FromHandle(hwnd);
    public Desktop(JsonObject p)
    {
        hwnd = (nint)long.Parse(p["hwnd"]!.ToString(), CultureInfo.InvariantCulture);
        GetWindowThreadProcessId(hwnd, out var actual);
        pid = p["pid"]!.GetValue<int>();
        if (pid != actual || !IsWindow(hwnd) || !IsWindowVisible(hwnd)) throw new IOException("window identity mismatch");
        started = Process.GetProcessById(pid).StartTime.ToUniversalTime().Ticks;
    }
    void Alive()
    {
        GetWindowThreadProcessId(hwnd, out var actual);
        if (!IsWindow(hwnd) || actual != pid || Process.GetProcessById(pid).StartTime.ToUniversalTime().Ticks != started)
            throw new IOException("target process/window expired");
    }
    public JsonObject Identity()
    {
        Alive();
        var process = Process.GetProcessById(pid);
        string? version = null;
        try { version = process.MainModule?.FileVersionInfo.FileVersion; } catch { }
        return JsonSerializer.SerializeToNode(new { session = Id, kind = "desktop", hwnd = (long)hwnd, pid, started, title = Root.Current.Name, version, dpi = GetDpiForWindow(hwnd) }, Broker.Json)!.AsObject();
    }
    public static IEnumerable<JsonObject> Windows()
    {
        var results = new List<JsonObject>();
        EnumWindows((h, _) =>
        {
            if (!IsWindowVisible(h)) return true;
            try
            {
                var el = AutomationElement.FromHandle(h);
                if (string.IsNullOrEmpty(el.Current.Name)) return true;
                GetWindowThreadProcessId(h, out var p);
                results.Add(new JsonObject { ["kind"] = "desktop", ["hwnd"] = (long)h, ["pid"] = p, ["title"] = el.Current.Name });
            }
            catch { }
            return true;
        }, 0);
        return results;
    }
    public JsonNode Execute(string method, JsonObject p)
    {
        using var inputLock = new Mutex(false, "Local\\AppUse-input-" + System.Security.Principal.WindowsIdentity.GetCurrent().User!.Value);
        try { if (!inputLock.WaitOne(5000)) throw new IOException("desktop input busy"); }
        catch (AbandonedMutexException) { /* The previous owner exited; this thread now owns the mutex. */ }
        try { var result = ExecuteLocked(method, p); Protect(result); return result; }
        finally { inputLock.ReleaseMutex(); }
    }
    void Protect(JsonNode node) {
        if (node is JsonObject obj) foreach (var pair in obj.ToArray()) {
            if (pair.Value is JsonValue value && value.TryGetValue<string>(out var text)) {
                foreach (var secret in secrets) text = text.Replace(secret, "[redacted]", StringComparison.Ordinal);
                obj[pair.Key] = text;
            } else if (pair.Value is { } child) Protect(child);
        }
        else if (node is JsonArray array) foreach (var child in array) if (child is not null) Protect(child);
    }
    JsonNode ExecuteLocked(string method, JsonObject p)
    {
        void Guard() {
            if (Stopped) throw new IOException("session stopped");
            if (p["expiresAt"] is { } expiry && DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() >= expiry.GetValue<long>()) throw new IOException("request expired before dispatch");
        }
        Guard();
        Alive();
        if (method == "observe") { if (p.ContainsKey("scope")) scope = p["scope"]?.DeepClone().AsObject(); return Observe(); }
        if (method == "capture") return Capture();
        if (method != "act") throw new IOException("unsupported desktop method");
        if (p["observation"]?.GetValue<string>() != observation || DateTime.UtcNow - captured > TimeSpan.FromSeconds(30))
            throw new IOException("stale observation; observe again");
        var a = p["action"]!.AsObject();
        var type = a["type"]!.GetValue<string>();
        // Consume observations before dispatch, including partially failed actions.
        observation = "";
        AutomationElement? target = null;
        if (a["target"] is { } targetId)
        {
            if (!nodes.TryGetValue(targetId.GetValue<string>(), out target)) throw new IOException("target outside observation");
            var now = Root.FindAll(TreeScope.Subtree, System.Windows.Automation.Condition.TrueCondition).Cast<AutomationElement>()
                .Where(e => Same(e, target)).ToArray();
            if (now.Length != 1) throw new IOException("target expired or ambiguous");
            target = now[0];
            if (Signature(target) != signatures[targetId.GetValue<string>()]) throw new IOException("target changed since observation");
            if (!target.Current.IsEnabled || target.Current.IsOffscreen) throw new IOException("target disabled or offscreen");
        }
        if (type == "focus")
        {
            if (!ForegroundInScope())
            {
                Guard(); ShowWindow(hwnd, 9);
                var foregroundThread = GetWindowThreadProcessId(GetForegroundWindow(), out _);
                var currentThread = GetCurrentThreadId();
                var attached = foregroundThread != currentThread && AttachThreadInput(currentThread, foregroundThread, true);
                try { Guard(); SetForegroundWindow(hwnd); }
                finally { if (attached) AttachThreadInput(currentThread, foregroundThread, false); }
                for (var retry = 0; retry < 25 && !ForegroundInScope(); retry++) Thread.Sleep(20);
            }
            if (!ForegroundInScope()) throw new IOException($"cannot acquire foreground (target {(long)hwnd}, actual {(long)GetForegroundWindow()})");
        }
        else if (type == "move")
        {
            if (!Root.TryGetCurrentPattern(TransformPattern.Pattern, out var transform)) throw new IOException("window cannot move");
            Guard(); ((TransformPattern)transform).Move(a["x"]!.GetValue<double>(), a["y"]!.GetValue<double>());
        }
        else if (type == "read") { if (target is null) throw new IOException("target required"); }
        else if (type == "invoke")
        {
            Need(target); Hit(target!);
            if (!target!.TryGetCurrentPattern(InvokePattern.Pattern, out var invoke)) throw new IOException("target does not support UIA Invoke");
            Guard(); ((InvokePattern)invoke).Invoke();
        }
        else
        {
            if (!ForegroundInScope()) throw new IOException("target window is not foreground; explicitly focus first");
            if (type == "key")
            {
                var focused = AutomationElement.FocusedElement;
                if (!Within(focused)) throw new IOException("focus is outside target window");
                Guard(); Key(a["key"]!.GetValue<string>());
            }
            else if (type == "scroll")
            {
                Need(target); Hit(target!);
                if (!target!.TryGetCurrentPattern(ScrollPattern.Pattern, out var scroll)) throw new IOException("target does not support UIA scrolling");
                var amount = a["direction"]?.GetValue<string>() == "up" ? ScrollAmount.LargeDecrement : ScrollAmount.LargeIncrement;
                Guard(); ((ScrollPattern)scroll).Scroll(ScrollAmount.NoAmount, amount);
            }
            else if (type == "select")
            {
                Need(target); Hit(target!);
                Guard();
                if (target!.TryGetCurrentPattern(SelectionItemPattern.Pattern, out var selection)) ((SelectionItemPattern)selection).Select();
                else
                {
                    if (target.TryGetCurrentPattern(ExpandCollapsePattern.Pattern, out var expand)) ((ExpandCollapsePattern)expand).Expand();
                    var choices = target.FindAll(TreeScope.Descendants, new PropertyCondition(AutomationElement.NameProperty, a["value"]!.GetValue<string>()))
                        .Cast<AutomationElement>().Where(e => e.TryGetCurrentPattern(SelectionItemPattern.Pattern, out _)).ToArray();
                    if (choices.Length != 1) throw new IOException("choice missing or ambiguous");
                    Guard(); ((SelectionItemPattern)choices[0].GetCurrentPattern(SelectionItemPattern.Pattern)).Select();
                    if (target.TryGetCurrentPattern(ExpandCollapsePattern.Pattern, out var collapse)) ((ExpandCollapsePattern)collapse).Collapse();
                }
            }
            else if (type == "fill")
            {
                Need(target); Hit(target!); Guard(); target!.SetFocus();
                for (var retry = 0; retry < 25 && !Same(AutomationElement.FocusedElement, target); retry++) Thread.Sleep(20);
                if (!Same(AutomationElement.FocusedElement, target)) throw new IOException("focus did not reach target");
                if (!target.TryGetCurrentPattern(ValuePattern.Pattern, out var value) || ((ValuePattern)value).Current.IsReadOnly)
                    throw new IOException("target does not support writable UIA value");
                var text = a["text"]!.GetValue<string>();
                if ((target.Current.IsPassword || a["sensitive"]?.GetValue<bool>() == true) && text.Length > 0) secrets.Add(text);
                Guard(); ((ValuePattern)value).SetValue(text);
            }
            else if (type is "click" or "drag")
            {
                Need(target); var point = Hit(target!);
                Point? destination = null;
                if (type == "drag") {
                    if (!nodes.TryGetValue(a["to"]!.GetValue<string>(), out var dest) || !Within(dest)
                        || Signature(dest) != signatures[a["to"]!.GetValue<string>()] || !dest.Current.IsEnabled || dest.Current.IsOffscreen)
                        throw new IOException("drag destination outside current observation");
                    destination = Hit(dest);
                }
                Guard();
                if (!SetCursorPos(point.X, point.Y)) throw new IOException("cannot position pointer");
                Mouse(2);
                try
                {
                    if (destination is { } end) { Guard(); SetCursorPos(end.X, end.Y); }
                }
                finally { Mouse(4); }
            }
            else throw new IOException("unsupported desktop action");
        }
        Thread.Sleep(80);
        if (!IsWindow(hwnd)) return new JsonObject { ["actionExecuted"] = true, ["goalVerified"] = false, ["targetClosed"] = true, ["observation"] = null };
        try { return new JsonObject { ["actionExecuted"] = true, ["goalVerified"] = false, ["observation"] = Observe() }; }
        catch (Exception e) { return new JsonObject { ["actionExecuted"] = true, ["goalVerified"] = false, ["observation"] = null, ["observationError"] = e.Message }; }
    }
    static void Need(AutomationElement? el) { if (el is null) throw new IOException("target required"); }
    bool ForegroundInScope() { var foreground = GetForegroundWindow(); return foreground == hwnd || GetAncestor(foreground, 3) == hwnd; }
    bool Within(AutomationElement el)
    {
        for (var n = el; n is not null; n = TreeWalker.RawViewWalker.GetParent(n)) if (Same(n, Root)) return true;
        return false;
    }
    static bool Same(AutomationElement a, AutomationElement b) => a.GetRuntimeId().SequenceEqual(b.GetRuntimeId());
    Point Hit(AutomationElement target)
    {
        var r = target.Current.BoundingRectangle;
        if (r.IsEmpty || r.Width <= 0 || r.Height <= 0) throw new IOException("target has no physical bounds");
        var point = new Point((int)(r.X + r.Width / 2), (int)(r.Y + r.Height / 2));
        var hit = AutomationElement.FromPoint(new System.Windows.Point(point.X, point.Y));
        var inside = false;
        for (var n = hit; n is not null; n = TreeWalker.RawViewWalker.GetParent(n)) if (Same(n, target)) { inside = true; break; }
        var hitWindow = WindowFromPoint(point);
        if (!inside || (GetAncestor(hitWindow, 2) != hwnd && GetAncestor(hitWindow, 3) != hwnd)) throw new IOException("target is occluded or hit-test escaped window");
        return point;
    }
    JsonObject Observe()
    {
        Alive(); nodes = new(); signatures = new(); var rows = new JsonArray(); var complete = true;
        var observationRoot = Root;
        if (scope is not null)
        {
            if (scope.Any(x => x.Key is not ("name" or "role")) || scope.Count == 0) throw new IOException("scope needs exact name/role");
            var matches = Root.FindAll(TreeScope.Subtree, System.Windows.Automation.Condition.TrueCondition).Cast<AutomationElement>()
                .Where(e => (scope["name"] is null || e.Current.Name == scope["name"]!.GetValue<string>()) && (scope["role"] is null || e.Current.ControlType.ProgrammaticName.Replace("ControlType.", "").ToLowerInvariant() == scope["role"]!.GetValue<string>())).ToArray();
            if (matches.Length != 1) throw new IOException("observation scope must be unique");
            observationRoot = matches[0];
        }
        var queue = new Queue<AutomationElement>(); queue.Enqueue(observationRoot);
        while (queue.TryDequeue(out var e))
        {
            if (rows.Count >= 1500) { complete = false; break; }
            try
            {
                var c = e.Current; var id = string.Join('.', e.GetRuntimeId()); nodes[id] = e; signatures[id] = Signature(e);
                string? value = null;
                if (!c.IsPassword && e.TryGetCurrentPattern(ValuePattern.Pattern, out var v)) value = ((ValuePattern)v).Current.Value;
                bool? selected = e.TryGetCurrentPattern(SelectionItemPattern.Pattern, out var s) ? ((SelectionItemPattern)s).Current.IsSelected : null;
                var r = c.BoundingRectangle;
                rows.Add(JsonSerializer.SerializeToNode(new { id, role = c.ControlType.ProgrammaticName.Replace("ControlType.", "").ToLowerInvariant(), name = c.IsPassword ? "[sensitive]" : c.Name, value, enabled = c.IsEnabled, visible = !c.IsOffscreen, focused = c.HasKeyboardFocus, selected, sensitive = c.IsPassword, automationId = c.AutomationId, context = "window:" + (long)hwnd, bounds = r.IsEmpty ? null : new { x = r.X, y = r.Y, width = r.Width, height = r.Height } }, Broker.Json));
                for (var child = TreeWalker.ControlViewWalker.GetFirstChild(e); child is not null; child = TreeWalker.ControlViewWalker.GetNextSibling(child)) queue.Enqueue(child);
            }
            catch (ElementNotAvailableException) { complete = false; }
        }
        observation = Guid.NewGuid().ToString("N"); captured = DateTime.UtcNow;
        return new JsonObject { ["id"] = observation, ["at"] = captured.ToString("O"), ["complete"] = complete, ["identity"] = Identity(), ["nodes"] = rows };
    }
    JsonObject Capture()
    {
        if (secrets.Count > 0) throw new IOException("capture refused: session contains sensitive input; use a sanitized fixture");
        var r = Root.Current.BoundingRectangle;
        if (GetForegroundWindow() != hwnd || r.Width <= 0 || r.Height <= 0) throw new IOException("foreground window required for capture");
        using var bitmap = new Bitmap((int)r.Width, (int)r.Height);
        using (var g = Graphics.FromImage(bitmap))
        {
            g.CopyFromScreen((int)r.X, (int)r.Y, 0, 0, bitmap.Size);
            foreach (AutomationElement e in Root.FindAll(TreeScope.Subtree, new PropertyCondition(AutomationElement.IsPasswordProperty, true)))
            {
                var b = e.Current.BoundingRectangle;
                g.FillRectangle(Brushes.Black, (float)(b.X - r.X), (float)(b.Y - r.Y), (float)b.Width, (float)b.Height);
            }
        }
        using var output = new MemoryStream(); bitmap.Save(output, ImageFormat.Png);
        return new JsonObject { ["mime"] = "image/png", ["data"] = Convert.ToBase64String(output.ToArray()) };
    }
    static string Signature(AutomationElement e)
    {
        var c = e.Current;
        return string.Join('|', c.Name, c.AutomationId, c.ControlType.Id, c.BoundingRectangle.ToString(CultureInfo.InvariantCulture), c.IsEnabled, c.IsOffscreen);
    }
    static void Key(string key)
    {
        var keys = key.Split('+').Select(k => k switch { "Ctrl" => 0x11, "Shift" => 0x10, "Alt" => 0x12, "Tab" => 9, "Enter" => 13, "Escape" => 27, "Space" => 32, "Backspace" => 8, "Delete" => 46, "Home" => 36, "End" => 35, "ArrowLeft" => 37, "ArrowUp" => 38, "ArrowRight" => 39, "ArrowDown" => 40, _ when k.Length == 1 && char.IsAsciiLetterOrDigit(k[0]) => char.ToUpperInvariant(k[0]), _ => throw new IOException("unsupported key") }).ToArray();
        if (keys.Contains(0x12) || keys.Length > 3) throw new IOException("system/global key combinations are outside window scope");
        foreach (var k in keys) SendKey((ushort)k, false);
        foreach (var k in keys.Reverse()) SendKey((ushort)k, true);
    }
    static void SendKey(ushort key, bool up) { var i = new INPUT { type = 1, data = new UNION { keyboard = new KEYBDINPUT { vk = key, flags = up ? 2u : 0 } } }; if (SendInput(1, [i], Marshal.SizeOf<INPUT>()) != 1) throw new IOException("SendInput rejected (integrity/focus)"); }
    static void Mouse(uint flags) { var i = new INPUT { data = new UNION { mouse = new MOUSEINPUT { flags = flags } } }; if (SendInput(1, [i], Marshal.SizeOf<INPUT>()) != 1) throw new IOException("SendInput rejected"); }
    [StructLayout(LayoutKind.Sequential)] struct INPUT { public uint type; public UNION data; }
    [StructLayout(LayoutKind.Explicit)] struct UNION { [FieldOffset(0)] public MOUSEINPUT mouse; [FieldOffset(0)] public KEYBDINPUT keyboard; }
    [StructLayout(LayoutKind.Sequential)] struct MOUSEINPUT { public int x, y; public uint data, flags, time; public nuint extra; }
    [StructLayout(LayoutKind.Sequential)] struct KEYBDINPUT { public ushort vk, scan; public uint flags, time; public nuint extra; }
    delegate bool EnumWindowCallback(nint hwnd, nint extra);
    [DllImport("user32.dll")] static extern bool EnumWindows(EnumWindowCallback callback, nint extra);
    [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(nint h, out int pid);
    [DllImport("user32.dll")] static extern bool IsWindow(nint h);
    [DllImport("user32.dll")] static extern bool IsWindowVisible(nint h);
    [DllImport("user32.dll")] static extern uint GetDpiForWindow(nint h);
    [DllImport("user32.dll")] static extern nint GetForegroundWindow();
    [DllImport("user32.dll")] static extern bool SetForegroundWindow(nint h);
    [DllImport("user32.dll")] static extern bool ShowWindow(nint h, int command);
    [DllImport("kernel32.dll")] static extern uint GetCurrentThreadId();
    [DllImport("user32.dll")] static extern bool AttachThreadInput(uint from, uint to, bool attach);
    [DllImport("user32.dll")] static extern bool SetCursorPos(int x, int y);
    [DllImport("user32.dll")] static extern nint WindowFromPoint(Point p);
    [DllImport("user32.dll")] static extern nint GetAncestor(nint h, uint flags);
    [DllImport("user32.dll")] static extern uint SendInput(uint count, INPUT[] inputs, int size);
}
