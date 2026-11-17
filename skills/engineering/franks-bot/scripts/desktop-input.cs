using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;

public static class FrankBotInput {
    [StructLayout(LayoutKind.Sequential)] public struct Point { public int X, Y; }
    [StructLayout(LayoutKind.Sequential)] public struct Rect { public int Left, Top, Right, Bottom; }
    [StructLayout(LayoutKind.Sequential)] private struct CursorInfo {
        public uint Size, Flags;
        public IntPtr Cursor;
        public Point Position;
    }
    [StructLayout(LayoutKind.Sequential)] private struct IconId {
        public uint Size;
        public IntPtr Window;
        public uint Id;
        public Guid Guid;
    }
    [StructLayout(LayoutKind.Sequential)] private struct Input {
        public uint Type;
        public InputData Data;
    }
    [StructLayout(LayoutKind.Explicit)] private struct InputData {
        [FieldOffset(0)] public Keyboard Keyboard;
        [FieldOffset(0)] public Mouse Mouse;
    }
    [StructLayout(LayoutKind.Sequential)] private struct Keyboard {
        public ushort VirtualKey, ScanCode;
        public uint Flags, Time;
        public UIntPtr Extra;
    }
    [StructLayout(LayoutKind.Sequential)] private struct Mouse {
        public int X, Y;
        public uint Data, Flags, Time;
        public UIntPtr Extra;
    }
    [DllImport("user32.dll")] public static extern bool IsWindow(IntPtr window);
    [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] public static extern IntPtr GetAncestor(IntPtr hwnd, uint flags);
    [DllImport("user32.dll")] public static extern IntPtr WindowFromPoint(Point point);
    [DllImport("user32.dll", SetLastError=true)] private static extern bool SetCursorPos(int x, int y);
    [DllImport("user32.dll", SetLastError=true)] private static extern uint SendInput(uint count, Input[] inputs, int size);
    [DllImport("user32.dll", SetLastError=true)] private static extern bool GetCursorInfo(ref CursorInfo info);
    [DllImport("user32.dll", CharSet=CharSet.Unicode)] private static extern IntPtr LoadCursor(IntPtr module, IntPtr id);
    [DllImport("shell32.dll")] private static extern int Shell_NotifyIconGetRect(ref IconId id, out Rect rect);
    [DllImport("user32.dll")] private static extern IntPtr SendMessageTimeout(IntPtr hwnd, uint msg, IntPtr wParam, IntPtr lParam, uint flags, uint timeout, out IntPtr result);
    [DllImport("user32.dll")] private static extern int GetMenuItemCount(IntPtr menu);
    [DllImport("user32.dll", CharSet=CharSet.Unicode)] private static extern int GetMenuString(IntPtr menu, uint pos, StringBuilder value, int size, uint flags);
    [DllImport("user32.dll")] private static extern bool GetMenuItemRect(IntPtr hwnd, IntPtr menu, uint pos, out Rect rect);

    private static void Send(Input[] inputs) {
        if (inputs.Length == 0) return;
        if (SendInput((uint)inputs.Length, inputs, Marshal.SizeOf(typeof(Input))) != inputs.Length)
            throw new Win32Exception(Marshal.GetLastWin32Error(), "Windows did not accept the requested input.");
    }
    private static Input Key(ushort key, ushort scan, uint flags) {
        return new Input { Type = 1, Data = new InputData { Keyboard = new Keyboard {
            VirtualKey = key, ScanCode = scan, Flags = flags
        }}};
    }
    private static Input MouseInput(uint flags, int delta = 0) {
        return new Input { Data = new InputData { Mouse = new Mouse {
            Flags = flags, Data = unchecked((uint)delta)
        }}};
    }
    [DllImport("kernel32.dll")] private static extern uint GetCurrentThreadId();
    [DllImport("user32.dll")] private static extern uint GetWindowThreadProcessId(IntPtr hwnd, out uint pid);
    [DllImport("user32.dll")] private static extern bool AttachThreadInput(uint first, uint second, bool attach);
    [DllImport("user32.dll")] private static extern bool SetForegroundWindow(IntPtr hwnd);
    [DllImport("user32.dll")] private static extern bool BringWindowToTop(IntPtr hwnd);
    [DllImport("user32.dll")] private static extern bool IsIconic(IntPtr hwnd);
    [DllImport("user32.dll")] private static extern bool IsWindowEnabled(IntPtr hwnd);
    [DllImport("user32.dll")] private static extern bool ShowWindowAsync(IntPtr hwnd, int command);
    public static bool EnsureForeground(IntPtr hwnd, int timeoutMs) {
        var timer = System.Diagnostics.Stopwatch.StartNew();
        if (!IsWindow(hwnd) || !IsWindowEnabled(hwnd)) return false;
        if (IsIconic(hwnd)) ShowWindowAsync(hwnd, 9);
        if (GetForegroundWindow() == hwnd && !IsIconic(hwnd)) return true;
        Activate(hwnd);
        while (GetForegroundWindow() != hwnd || IsIconic(hwnd)) {
            if (timer.ElapsedMilliseconds >= timeoutMs) return false;
            Thread.Sleep(5);
        }
        return true;
    }
    public static bool Activate(IntPtr hwnd) {
        if (SetForegroundWindow(hwnd) && GetForegroundWindow() == hwnd) return true;
        uint ignored;
        uint current = GetCurrentThreadId();
        uint foreground = GetWindowThreadProcessId(GetForegroundWindow(), out ignored);
        uint target = GetWindowThreadProcessId(hwnd, out ignored);
        bool attachedForeground = foreground != 0 && foreground != current && AttachThreadInput(current, foreground, true);
        bool attachedTarget = target != 0 && target != current && target != foreground && AttachThreadInput(current, target, true);
        try {
            BringWindowToTop(hwnd);
            SetForegroundWindow(hwnd);
            return GetForegroundWindow() == hwnd;
        } finally {
            if (attachedTarget) AttachThreadInput(current, target, false);
            if (attachedForeground) AttachThreadInput(current, foreground, false);
        }
    }
    public static void Move(int x, int y) {
        if (!SetCursorPos(x, y)) throw new Win32Exception(Marshal.GetLastWin32Error());
    }
    public static void Click(bool right, int count) {
        for (int i = 0; i < count; i++) {
            Send(new[] { MouseInput(right ? 8u : 2u), MouseInput(right ? 16u : 4u) });
            if (i + 1 < count) Thread.Sleep(45);
        }
    }
    public static void Drag(int x, int y, int toX, int toY) {
        Send(new[] { MouseInput(2) });
        try {
            for (int step = 1; step <= 12; step++) {
                Move(x + (toX-x)*step/12, y + (toY-y)*step/12);
                Thread.Sleep(15);
            }
        } finally { Send(new[] { MouseInput(4) }); }
    }
    public static void Scroll(int delta) { Send(new[] { MouseInput(0x800, delta) }); }
    public static void Keys(ushort[] keys) {
        var sequence = new List<Input>();
        foreach (ushort key in keys) sequence.Add(Key(key, 0, 0));
        for (int i = keys.Length - 1; i >= 0; i--) sequence.Add(Key(keys[i], 0, 2));
        Send(sequence.ToArray());
    }
    public static void Type(string text) {
        var sequence = new List<Input>();
        foreach (char code in text) {
            sequence.Add(Key(0, code, 4));
            sequence.Add(Key(0, code, 6));
        }
        Send(sequence.ToArray());
    }
    public static string Cursor() {
        var info = new CursorInfo { Size = (uint)Marshal.SizeOf(typeof(CursorInfo)) };
        if (!GetCursorInfo(ref info)) throw new Win32Exception(Marshal.GetLastWin32Error());
        if ((info.Flags & 1) == 0) return "hidden";
        if (info.Cursor == LoadCursor(IntPtr.Zero, (IntPtr)32649)) return "hand";
        if (info.Cursor == LoadCursor(IntPtr.Zero, (IntPtr)32513)) return "ibeam";
        if (info.Cursor == LoadCursor(IntPtr.Zero, (IntPtr)32512)) return "arrow";
        return "custom";
    }
    public static Rect TrayIcon(IntPtr window, uint id, Guid guid) {
        var icon = new IconId { Size = (uint)Marshal.SizeOf(typeof(IconId)), Window = window, Id = id, Guid = guid };
        Rect rect;
        if (Shell_NotifyIconGetRect(ref icon, out rect) != 0)
            throw new InvalidOperationException("No registered tray icon matches the bound window and icon identity.");
        return rect;
    }
    public sealed class MenuItem {
        public string Label;
        public Rect Bounds;
    }
    public static MenuItem[] Menu(IntPtr window) {
        IntPtr menu;
        // The native popup window exposes its own HMENU through MN_GETHMENU.
        if (SendMessageTimeout(window, 0x1E1, IntPtr.Zero, IntPtr.Zero, 2, 1000, out menu) == IntPtr.Zero || menu == IntPtr.Zero)
            throw new InvalidOperationException("Cannot read the native popup menu.");
        var items = new List<MenuItem>();
        for (uint i = 0; i < GetMenuItemCount(menu); i++) {
            var label = new StringBuilder(512);
            GetMenuString(menu, i, label, label.Capacity, 0x400);
            Rect rect;
            if (label.Length > 0 && GetMenuItemRect(window, menu, i, out rect))
                items.Add(new MenuItem { Label = label.ToString(), Bounds = rect });
        }
        return items.ToArray();
    }
}
