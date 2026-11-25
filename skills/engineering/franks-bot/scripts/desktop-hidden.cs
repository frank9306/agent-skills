using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;

public static class FrankBotHidden
{
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    private struct StartupInfo
    {
        public int Size;
        public string Reserved, Desktop, Title;
        public int X, Y, Width, Height, XChars, YChars, Fill, Flags;
        public short Show, ReservedSize;
        public IntPtr ReservedData, Input, Output, Error;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct ProcessInfo
    {
        public IntPtr Process, Thread;
        public int Pid, ThreadId;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct Point { public int X, Y; }

    [StructLayout(LayoutKind.Sequential)]
    private struct Rect { public int Left, Top, Right, Bottom; }

    public sealed class Window
    {
        public long windowId { get; set; }
        public int processId { get; set; }
        public string title { get; set; }
        public long ownerId { get; set; }
        public bool visible { get; set; }
    }

    private delegate bool EnumWindow(IntPtr window, IntPtr data);
    [DllImport("user32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern IntPtr CreateDesktop(string name, IntPtr device, IntPtr mode, uint flags, uint access, IntPtr security);
    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr GetThreadDesktop(uint id);
    [DllImport("kernel32.dll")]
    private static extern uint GetCurrentThreadId();
    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool CloseDesktop(IntPtr desktop);
    [DllImport("user32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern IntPtr OpenDesktop(string name, uint flags, bool inherit, uint access);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    private static extern bool GetUserObjectInformation(IntPtr handle, int index, StringBuilder value, uint length, out uint needed);
    [DllImport("kernel32.dll")]
    private static extern IntPtr GetStdHandle(int id);
    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool GetExitCodeProcess(IntPtr handle, out int code);
    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool EnumWindows(EnumWindow callback, IntPtr data);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    private static extern int GetWindowText(IntPtr window, StringBuilder value, int length);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    private static extern int GetClassName(IntPtr window, StringBuilder value, int length);
    [DllImport("user32.dll")]
    private static extern int GetWindowLong(IntPtr window, int index);
    [DllImport("user32.dll", EntryPoint = "SendMessageTimeoutW", SetLastError = true)]
    private static extern IntPtr QueryMessage(IntPtr window, uint message, IntPtr wParam, IntPtr lParam,
        uint flags, uint timeout, out IntPtr result);
    [DllImport("user32.dll", EntryPoint = "SendMessageTimeoutW", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern IntPtr ReadMessage(IntPtr window, uint message, IntPtr size, StringBuilder text,
        uint flags, uint timeout, out IntPtr result);
    [DllImport("user32.dll", EntryPoint = "SendMessageTimeoutW", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern IntPtr WriteMessage(IntPtr window, uint message, IntPtr unused, string text,
        uint flags, uint timeout, out IntPtr result);
    [DllImport("user32.dll")]
    private static extern IntPtr GetParent(IntPtr window);
    [DllImport("user32.dll")]
    private static extern int GetDlgCtrlID(IntPtr window);
    [DllImport("user32.dll")]
    private static extern bool IsChild(IntPtr parent, IntPtr window);
    [DllImport("user32.dll")]
    private static extern IntPtr GetWindow(IntPtr window, uint command);
    [DllImport("user32.dll")]
    private static extern bool IsWindowVisible(IntPtr window);
    [DllImport("user32.dll")]
    private static extern bool IsWindowEnabled(IntPtr window);
    [DllImport("user32.dll")]
    private static extern uint GetWindowThreadProcessId(IntPtr window, out int pid);
    [DllImport("user32.dll")]
    private static extern bool ScreenToClient(IntPtr window, ref Point point);
    [DllImport("user32.dll")]
    private static extern bool GetClientRect(IntPtr window, out Rect rect);
    [DllImport("user32.dll")]
    private static extern IntPtr ChildWindowFromPointEx(IntPtr window, Point point, uint flags);
    [DllImport("user32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern bool PostMessage(IntPtr window, uint message, IntPtr wParam, IntPtr lParam);
    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern bool CreateProcess(string executable, StringBuilder command, IntPtr processSecurity,
        IntPtr threadSecurity, bool inherit, uint flags, IntPtr environment, string directory,
        ref StartupInfo startup, out ProcessInfo process);
    [DllImport("kernel32.dll")]
    private static extern uint WaitForSingleObject(IntPtr handle, uint milliseconds);
    [DllImport("kernel32.dll")]
    private static extern bool CloseHandle(IntPtr handle);

    private static IntPtr desktop;
    private static string desktopName;
    private static ProcessInfo process;

    public static int Bootstrap(string executable, string bridge)
    {
        desktopName = "FranksBot_" + Guid.NewGuid().ToString("N");
        const uint desktopAccess = 0x0083; // read objects, create windows, enumerate
        desktop = CreateDesktop(desktopName, IntPtr.Zero, IntPtr.Zero, 0, desktopAccess, IntPtr.Zero);
        if (desktop == IntPtr.Zero)
            throw new Win32Exception(Marshal.GetLastWin32Error());
        try
        {
            var startup = new StartupInfo {
                Size = Marshal.SizeOf(typeof(StartupInfo)), Desktop = @"WinSta0\" + desktopName,
                Flags = 0x100, Input = GetStdHandle(-10), Output = GetStdHandle(-11), Error = GetStdHandle(-12)
            };
            var command = new StringBuilder(string.Format("\"{0}\" -NoProfile -STA -File \"{1}\" -DesktopName {2}",
                executable, bridge, desktopName));
            ProcessInfo child;
            if (!CreateProcess(executable, command, IntPtr.Zero, IntPtr.Zero, true, 0x08000000,
                IntPtr.Zero, null, ref startup, out child))
                throw new Win32Exception(Marshal.GetLastWin32Error());
            CloseHandle(child.Thread);
            try
            {
                int code;
                if (WaitForSingleObject(child.Process, uint.MaxValue) != 0 || !GetExitCodeProcess(child.Process, out code))
                    throw new Win32Exception(Marshal.GetLastWin32Error());
                return code;
            }
            finally { CloseHandle(child.Process); }
        }
        finally
        {
            if (!CloseDesktop(desktop))
                throw new Win32Exception(Marshal.GetLastWin32Error());
            for (int attempt = 0; ; attempt++)
            {
                var probe = OpenDesktop(desktopName, 0, false, 1);
                if (probe == IntPtr.Zero)
                {
                    const int fileNotFound = 2;
                    if (Marshal.GetLastWin32Error() != fileNotFound)
                        throw new Win32Exception(Marshal.GetLastWin32Error());
                    break;
                }
                CloseDesktop(probe);
                if (attempt >= 29)
                    throw new InvalidOperationException("The hidden desktop still has open references.");
                Thread.Sleep(100);
            }
        }
    }

    public static void VerifyDesktop(string expected)
    {
        var current = GetThreadDesktop(GetCurrentThreadId());
        var name = new StringBuilder(256);
        uint needed;
        if (!GetUserObjectInformation(current, 2, name, (uint)(name.Capacity * 2), out needed) ||
            name.ToString() != expected || !expected.StartsWith("FranksBot_", StringComparison.Ordinal))
            throw new InvalidOperationException("Hidden desktop binding failed.");
        desktop = current;
        desktopName = expected;
    }

    public static int Launch(string executable, string command, string directory)
    {
        if (desktop == IntPtr.Zero || process.Process != IntPtr.Zero)
            throw new InvalidOperationException("The hidden desktop must own exactly one launch.");
        var startup = new StartupInfo { Size = Marshal.SizeOf(typeof(StartupInfo)), Desktop = @"WinSta0\" + desktopName };
        const uint noConsole = 0x08000000;
        if (!CreateProcess(executable, new StringBuilder(command), IntPtr.Zero, IntPtr.Zero, false,
            noConsole, IntPtr.Zero, directory, ref startup, out process))
            throw new Win32Exception(Marshal.GetLastWin32Error());
        CloseHandle(process.Thread);
        return process.Pid;
    }

    public static bool Exited()
    {
        return process.Process == IntPtr.Zero || WaitForSingleObject(process.Process, 0) == 0;
    }

    private static bool Owned(IntPtr window)
    {
        int pid;
        return !Exited() && GetWindowThreadProcessId(window, out pid) != 0 && pid == process.Pid;
    }

    public static Window[] List()
    {
        var windows = new List<Window>();
        if (Exited())
            return windows.ToArray();
        bool success = EnumWindows(delegate(IntPtr window, IntPtr unused)
        {
            if (Owned(window))
            {
                var title = new StringBuilder(512);
                GetWindowText(window, title, title.Capacity);
                windows.Add(new Window {
                    windowId = window.ToInt64(), processId = process.Pid, title = title.ToString(),
                    ownerId = GetWindow(window, 4).ToInt64(), visible = IsWindowVisible(window)
                });
            }
            return true;
        }, IntPtr.Zero);
        const int invalidParameter = 87; // a new desktop has no top-level windows yet
        if (!success && Marshal.GetLastWin32Error() != invalidParameter)
            throw new Win32Exception(Marshal.GetLastWin32Error());
        return windows.ToArray();
    }

    public static void RequireWindow(IntPtr window)
    {
        foreach (Window candidate in List())
            if (candidate.windowId == window.ToInt64() && candidate.visible)
                return;
        throw new InvalidOperationException("Window is not a visible top-level window of the launched application on this desktop.");
    }

    private static void Post(IntPtr window, uint message, int wParam, int lParam)
    {
        if (!Owned(window) || !PostMessage(window, message, (IntPtr)wParam, (IntPtr)lParam))
            throw new InvalidOperationException("Could not deliver a message to the test window.");
    }

    public static void Click(IntPtr window, int x, int y)
    {
        RequireWindow(window);
        const uint skipInvisibleOrTransparentChildren = 5;
        var origin = new Point { X = x, Y = y };
        var point = origin;
        var receiver = window;
        while (true)
        {
            Rect client;
            point = origin;
            if (!IsWindowEnabled(receiver) || !ScreenToClient(receiver, ref point) ||
                !GetClientRect(receiver, out client) || point.X < 0 || point.Y < 0 ||
                point.X >= client.Right || point.Y >= client.Bottom ||
                point.X > short.MaxValue || point.Y > short.MaxValue)
                throw new InvalidOperationException("Coordinate is outside the enabled test control's client area.");
            var child = ChildWindowFromPointEx(receiver, point, skipInvisibleOrTransparentChildren);
            if (child == IntPtr.Zero || child == receiver)
                break;
            if (!Owned(child))
                throw new InvalidOperationException("Target child window is not owned by the test process.");
            receiver = child;
        }
        int position = (point.Y << 16) | point.X;
        Post(receiver, 0x0201, 1, position); // WM_LBUTTONDOWN
        Post(receiver, 0x0202, 0, position); // WM_LBUTTONUP
    }

    public static bool IsPushButton(IntPtr root, IntPtr window)
    {
        if (!Owned(window) || !IsChild(root, window) || !IsWindowVisible(window) || !IsWindowEnabled(window))
            return false;
        var type = new StringBuilder(128);
        GetClassName(window, type, type.Capacity);
        int style = GetWindowLong(window, -16) & 0xF;
        return type.ToString().Equals("Button", StringComparison.OrdinalIgnoreCase) && (style == 0 || style == 1);
    }

    public static void InvokeButton(IntPtr root, IntPtr button)
    {
        RequireWindow(root);
        if (!IsPushButton(root, button))
            throw new InvalidOperationException("Target is not an enabled native push button.");
        IntPtr parent = GetParent(button);
        int id = GetDlgCtrlID(button);
        // BN_CLICKED has code zero and the sender is the verified child window.
        if (!Owned(parent) || id <= 0 || id > ushort.MaxValue ||
            !PostMessage(parent, 0x0111, (IntPtr)id, button))
            throw new InvalidOperationException("Native push button notification could not be delivered.");
    }

    public static bool IsEdit(IntPtr root, IntPtr window)
    {
        if (!Owned(window) || !IsChild(root, window) || !IsWindowVisible(window) || !IsWindowEnabled(window))
            return false;
        var type = new StringBuilder(128);
        GetClassName(window, type, type.Capacity);
        return type.ToString().Equals("Edit", StringComparison.OrdinalIgnoreCase) ||
            type.ToString().StartsWith("WindowsForms10.EDIT.", StringComparison.OrdinalIgnoreCase);
    }

    public static string ReadEdit(IntPtr root, IntPtr window)
    {
        const int passwordStyle = 0x20;
        if (!IsEdit(root, window) || (GetWindowLong(window, -16) & passwordStyle) != 0)
            return null;
        IntPtr length;
        if (QueryMessage(window, 0x000E, IntPtr.Zero, IntPtr.Zero, 2, 1000, out length) == IntPtr.Zero ||
            length.ToInt64() < 0 || length.ToInt64() >= 1000000)
            throw new InvalidOperationException("Native edit length could not be read.");
        var text = new StringBuilder(length.ToInt32() + 1);
        IntPtr result;
        if (ReadMessage(window, 0x000D, (IntPtr)text.Capacity, text, 2, 1000, out result) == IntPtr.Zero)
            throw new InvalidOperationException("Native edit value could not be read.");
        return text.ToString();
    }

    public static void WriteEdit(IntPtr root, IntPtr window, string value)
    {
        RequireWindow(root);
        const int readOnlyStyle = 0x800;
        if (!IsEdit(root, window) || (GetWindowLong(window, -16) & readOnlyStyle) != 0)
            throw new InvalidOperationException("Target is not an enabled, writable native edit.");
        IntPtr result;
        if (WriteMessage(window, 0x000C, IntPtr.Zero, value, 2, 1000, out result) == IntPtr.Zero ||
            result == IntPtr.Zero)
            throw new InvalidOperationException("Native edit did not accept text.");
    }

    public static void RequestClose()
    {
        var windows = List();
        foreach (var window in windows)
            if (window.visible && window.ownerId != 0 && !Exited())
                Post((IntPtr)window.windowId, 0x0010, 0, 0); // WM_CLOSE
        foreach (var window in windows)
            if (window.visible && window.ownerId == 0 && !Exited())
                Post((IntPtr)window.windowId, 0x0010, 0, 0);
    }
}
