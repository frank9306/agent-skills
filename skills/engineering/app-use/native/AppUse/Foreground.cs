using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Security.Principal;
using System.Text;
using System.Text.Json.Nodes;

namespace AppUse;

internal static class Foreground
{
    public static JsonObject Activate(nint hwnd, Action guard)
    {
        using var input = new Mutex(false, "Local\\AppUse-input-" + WindowsIdentity.GetCurrent().User!.Value);
        try { if (!input.WaitOne(3000)) throw new IOException("foreground input busy"); }
        catch (AbandonedMutexException) { }
        try { return ActivateLocked(hwnd, guard); }
        finally { input.ReleaseMutex(); }
    }

    static JsonObject ActivateLocked(nint hwnd, Action guard)
    {
        GetWindowThreadProcessId(hwnd, out var pid);
        if (pid == 0 || !IsWindow(hwnd)) throw new IOException("foreground target expired");
        var started = Process.GetProcessById(pid).StartTime.ToUniversalTime().Ticks;
        var until = Stopwatch.StartNew();
        var attempts = 0; var assisted = false;
        void Check() {
            guard(); GetWindowThreadProcessId(hwnd, out var now);
            if (!IsWindow(hwnd) || now != pid || Process.GetProcessById(pid).StartTime.ToUniversalTime().Ticks != started)
                throw new IOException("foreground window identity changed");
            if (!IsWindowEnabled(hwnd)) throw new IOException("foreground target is blocked by a modal; bind its dialog window");
        }
        Check();
        if (IsIconic(hwnd)) {
            if (!ShowWindowAsync(hwnd, 9)) throw new IOException("cannot request minimized window restoration");
            while (IsIconic(hwnd) && until.ElapsedMilliseconds < 1000) { Check(); Thread.Sleep(20); }
            if (IsIconic(hwnd)) throw new IOException("minimized window did not restore");
        }
        while (until.ElapsedMilliseconds < 2500) {
            Check();
            if (GetForegroundWindow() == hwnd) {
                Thread.Sleep(40); Check();
                if (GetForegroundWindow() == hwnd)
                    return new JsonObject { ["verified"] = true, ["hwnd"] = (long)hwnd, ["pid"] = pid,
                        ["method"] = assisted ? "native-input-assisted" : "native", ["attempts"] = attempts };
            }
            if (attempts > 0) {
                // ALT releases the foreground lock. Keep this private to activation;
                // arbitrary global key input is still unavailable to callers.
                if (ModifiersHeld()) { Thread.Sleep(20); continue; }
                Check();
                var events = new[] { Key(false), Key(true) };
                var sent = SendInput(2, events, Marshal.SizeOf<INPUT>());
                if (sent == 1 && SendInput(1, [Key(true)], Marshal.SizeOf<INPUT>()) != 1)
                    throw new IOException("foreground ALT release rejected; release ALT before retrying");
                if (sent != 2) throw new IOException("foreground activation input assist rejected");
                assisted = true;
            }
            Check(); attempts++;
            BringWindowToTop(hwnd);
            SetForegroundWindow(hwnd);
            for (var wait = 0; wait < 8 && GetForegroundWindow() != hwnd; wait++) { Check(); Thread.Sleep(20); }
            if (attempts >= 3 && GetForegroundWindow() != hwnd) break;
        }
        throw new IOException($"cannot acquire foreground (target {(long)hwnd}, actual {(long)GetForegroundWindow()}, attempts {attempts}, inputAssisted {assisted})");
    }

    public static JsonObject ActivateBrowser(string marker, Action guard)
    {
        if (!Guid.TryParseExact(marker, "D", out _)) throw new IOException("invalid browser activation marker");
        var prefix = "app-use focus " + marker;
        var until = Stopwatch.StartNew();
        while (until.ElapsedMilliseconds < 1500) {
            guard(); var matches = new List<nint>();
            EnumWindows((h, _) => {
                var title = new StringBuilder(512); GetWindowText(h, title, title.Capacity);
                var cls = new StringBuilder(128); GetClassName(h, cls, cls.Capacity);
                if (IsWindowVisible(h) && cls.ToString() == "Chrome_WidgetWin_1"
                    && (title.ToString() == prefix || title.ToString().StartsWith(prefix + " - ", StringComparison.Ordinal))) matches.Add(h);
                return true;
            }, 0);
            if (matches.Count > 1) throw new IOException("browser activation marker is ambiguous");
            if (matches.Count == 1) {
                var target = matches[0];
                return Activate(target, () => {
                    guard(); var title = new StringBuilder(512); GetWindowText(target, title, title.Capacity);
                    if (title.ToString() != prefix && !title.ToString().StartsWith(prefix + " - ", StringComparison.Ordinal))
                        throw new IOException("browser activation marker changed or stopped");
                });
            }
            Thread.Sleep(20);
        }
        throw new IOException("browser activation marker window unavailable");
    }

    static bool ModifiersHeld() => new[] { 1, 2, 4, 0x10, 0x11, 0x12, 0x5b, 0x5c }.Any(k => (GetAsyncKeyState(k) & 0x8000) != 0);
    static INPUT Key(bool up) => new() { type = 1, data = new UNION { keyboard = new KEYBDINPUT { vk = 0x12, flags = up ? 2u : 0 } } };
    [StructLayout(LayoutKind.Sequential)] struct INPUT { public uint type; public UNION data; }
    [StructLayout(LayoutKind.Explicit)] struct UNION { [FieldOffset(0)] public MOUSEINPUT mouse; [FieldOffset(0)] public KEYBDINPUT keyboard; }
    [StructLayout(LayoutKind.Sequential)] struct MOUSEINPUT { public int x, y; public uint data, flags, time; public nuint extra; }
    [StructLayout(LayoutKind.Sequential)] struct KEYBDINPUT { public ushort vk, scan; public uint flags, time; public nuint extra; }
    delegate bool EnumWindowCallback(nint hwnd, nint extra);
    [DllImport("user32.dll")] static extern bool EnumWindows(EnumWindowCallback callback, nint extra);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int GetWindowText(nint hwnd, StringBuilder text, int count);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int GetClassName(nint hwnd, StringBuilder text, int count);
    [DllImport("user32.dll")] static extern bool IsWindow(nint hwnd);
    [DllImport("user32.dll")] static extern bool IsWindowVisible(nint hwnd);
    [DllImport("user32.dll")] static extern bool IsWindowEnabled(nint hwnd);
    [DllImport("user32.dll")] static extern bool IsIconic(nint hwnd);
    [DllImport("user32.dll")] static extern bool ShowWindowAsync(nint hwnd, int command);
    [DllImport("user32.dll")] static extern bool BringWindowToTop(nint hwnd);
    [DllImport("user32.dll")] static extern bool SetForegroundWindow(nint hwnd);
    [DllImport("user32.dll")] static extern nint GetForegroundWindow();
    [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(nint hwnd, out int pid);
    [DllImport("user32.dll")] static extern short GetAsyncKeyState(int key);
    [DllImport("user32.dll")] static extern uint SendInput(uint count, INPUT[] inputs, int size);
}
