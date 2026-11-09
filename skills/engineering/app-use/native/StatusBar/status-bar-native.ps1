# status-bar-native.ps1 - Native Win32 overlay status bar for app-use
#
# Creates a topmost, no-activate, click-through, tool-window overlay using
# Win32 CreateWindowEx + GDI rendering. Functionally identical to the Go
# implementation in native/StatusBar/main.go.
#
# Window flags:
#   WS_EX_NOACTIVATE    - does not steal foreground focus
#   WS_EX_TRANSPARENT   - mouse clicks pass through to windows below
#   WS_EX_TOOLWINDOW    - does not appear in Alt-Tab
#   WS_EX_TOPMOST       - stays on top (session-scoped, destroyed on exit)
#   WS_EX_LAYERED       - supports per-pixel alpha and smooth repaint
#
# Reads status events from stdin (one JSON object per line).
# On heartbeat timeout (2s), switches to "unknown" state.
# On extended silence (3s), hides the window.
# On stdin EOF or "stop" event, destroys the window and exits.

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# ---------------------------------------------------------------------------
# Native Win32 helper class (compiled at runtime via Add-Type)
# ---------------------------------------------------------------------------
$nativeSrc = @'
using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Web.Script.Serialization;

public static class AppUseStatusBar
{
    // ---- Win32 constants ----
    public const uint WS_EX_NOACTIVATE  = 0x08000000;
    public const uint WS_EX_TRANSPARENT = 0x00000020;
    public const uint WS_EX_TOOLWINDOW  = 0x00000080;
    public const uint WS_EX_TOPMOST     = 0x00000008;
    public const uint WS_EX_LAYERED     = 0x00080000;
    public const uint WS_POPUP         = 0x80000000;
    public const uint WS_VISIBLE       = 0x10000000;
    public const uint WS_CLIPSIBLINGS  = 0x04000000;
    public const uint WS_CLIPCHILDREN  = 0x02000000;

    public const int SW_SHOWNOACTIVATE = 4;
    public const int SW_HIDE           = 0;

    public const uint WM_PAINT     = 0x000F;
    public const uint WM_TIMER     = 0x0113;
    public const uint WM_DESTROY   = 0x0002;
    public const uint WM_GETOBJECT = 0x003D;

    public const int PS_SOLID = 0;
    public const int PS_DASH  = 1;

    public const uint DT_SINGLELINE = 0x00000020;
    public const uint DT_VCENTER    = 0x00000004;
    public const uint DT_NOCLIP     = 0x0100;

    public const int SM_CXSCREEN = 0;
    public const int SM_CYSCREEN = 1;

    public const uint TA_CENTER = 6;
    public const uint TA_LEFT   = 0;
    public const uint TA_RIGHT  = 2;

    public const int TRANSPARENT_BK = 1;
    public const int COLOR_WINDOW = 5;

    public const uint LWA_ALPHA = 2;

    public const uint TIMER_ANIMATE = 1;
    public const uint TIMER_HEARTBEAT = 2;

    // Custom messages used to marshal window-affecting calls onto the
    // window's own thread (ShowWindow/SetWindowPos from another thread are
    // silently dropped when the owner thread has no message pump yet).
    public const uint WM_APP_SHOW = 0x8001;
    public const uint WM_APP_HIDE = 0x8002;

    // ---- Native declarations ----
    [StructLayout(LayoutKind.Sequential)]
    public struct RECT { public int Left, Top, Right, Bottom; }

    [StructLayout(LayoutKind.Sequential)]
    public struct POINT { public int X, Y; }

    [StructLayout(LayoutKind.Sequential)]
    public struct MSG
    {
        public IntPtr hwnd;
        public uint message;
        public IntPtr wParam;
        public IntPtr lParam;
        public uint time;
        public POINT pt;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct WNDCLASSEX
    {
        public uint cbSize;
        public uint style;
        public IntPtr lpfnWndProc;
        public int cbClsExtra;
        public int cbWndExtra;
        public IntPtr hInstance;
        public IntPtr hIcon;
        public IntPtr hCursor;
        public IntPtr hbrBackground;
        [MarshalAs(UnmanagedType.LPWStr)] public string lpszMenuName;
        [MarshalAs(UnmanagedType.LPWStr)] public string lpszClassName;
        public IntPtr hIconSm;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct PAINTSTRUCT
    {
        public IntPtr hdc;
        [MarshalAs(UnmanagedType.Bool)] public bool fErase;
        public RECT rcPaint;
        [MarshalAs(UnmanagedType.Bool)] public bool fRestore;
        [MarshalAs(UnmanagedType.Bool)] public bool fIncUpdate;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 32)] public byte[] rgbReserved;
    }

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    public struct LOGFONT
    {
        public int lfHeight, lfWidth, lfEscapement, lfOrientation, lfWeight;
        public byte lfItalic, lfUnderline, lfStrikeOut, lfCharSet,
                      lfOutPrecision, lfClipPrecision, lfQuality, lfPitchAndFamily;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)]
        public string lfFaceName;
    }

    public delegate IntPtr WndProcDelegate(IntPtr hWnd, uint msg, IntPtr wParam, IntPtr lParam);

    [DllImport("user32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    public static extern ushort RegisterClassEx(ref WNDCLASSEX lpwcx);

    [DllImport("user32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    public static extern IntPtr CreateWindowEx(uint dwExStyle, string lpClassName, string lpWindowName,
        uint dwStyle, int x, int y, int nWidth, int nHeight, IntPtr hWndParent, IntPtr hMenu,
        IntPtr hInstance, IntPtr lpParam);

    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool DestroyWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern IntPtr DefWindowProc(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);

    [DllImport("user32.dll")]
    public static extern int GetMessage(out MSG lpMsg, IntPtr hWnd, uint wMsgFilterMin, uint wMsgFilterMax);

    [DllImport("user32.dll")]
    public static extern IntPtr DispatchMessage(ref MSG lpMsg);

    [DllImport("user32.dll")]
    public static extern void PostQuitMessage(int nExitCode);

    [DllImport("user32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool PostMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);

    [DllImport("user32.dll")]
    public static extern IntPtr BeginPaint(IntPtr hWnd, out PAINTSTRUCT lpPaint);

    [DllImport("user32.dll")]
    public static extern bool EndPaint(IntPtr hWnd, ref PAINTSTRUCT lpPaint);

    [DllImport("user32.dll")]
    public static extern IntPtr SetTimer(IntPtr hWnd, IntPtr nIDEvent, uint uElapse, IntPtr lpTimerFunc);

    [DllImport("user32.dll")]
    public static extern bool KillTimer(IntPtr hWnd, IntPtr idEvent);

    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

    [DllImport("user32.dll")]
    public static extern int GetSystemMetrics(int nIndex);

    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool InvalidateRect(IntPtr hWnd, ref RECT lpRect, bool bErase);

    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool SetLayeredWindowAttributes(IntPtr hwnd, uint crKey, byte bAlpha, uint dwFlags);

    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool SetProcessDPIAware();

    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();

    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    public static extern IntPtr GetModuleHandle(string lpModuleName);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern IntPtr SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);

    public static readonly IntPtr HWND_TOPMOST = new IntPtr(-1);
    public const uint SWP_NOSIZE = 0x0001;
    public const uint SWP_NOMOVE = 0x0002;
    public const uint SWP_NOACTIVATE = 0x0010;
    public const uint SWP_SHOWWINDOW = 0x0040;

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

    [DllImport("user32.dll")]
    public static extern int GetWindowLong(IntPtr hWnd, int nIndex);

    [DllImport("gdi32.dll")]
    public static extern IntPtr CreateSolidBrush(uint color);

    [DllImport("gdi32.dll")]
    public static extern IntPtr CreatePen(int style, int width, uint color);

    [DllImport("gdi32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool DeleteObject(IntPtr hObject);

    [DllImport("gdi32.dll")]
    public static extern IntPtr SelectObject(IntPtr hdc, IntPtr hgdiobj);

    [DllImport("gdi32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool RoundRect(IntPtr hdc, int left, int top, int right, int bottom, int widthEllipse, int heightEllipse);

    [DllImport("gdi32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool Ellipse(IntPtr hdc, int left, int top, int right, int bottom);

    [DllImport("gdi32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool MoveToEx(IntPtr hdc, int x, int y, IntPtr lpPoint);

    [DllImport("gdi32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool LineTo(IntPtr hdc, int x, int y);

    [DllImport("gdi32.dll")]
    public static extern uint SetTextAlign(IntPtr hdc, uint fMode);

    [DllImport("gdi32.dll")]
    public static extern uint SetTextColor(IntPtr hdc, uint color);

    [DllImport("gdi32.dll")]
    public static extern int SetBkMode(IntPtr hdc, int mode);

    [DllImport("gdi32.dll", CharSet = CharSet.Unicode)]
    public static extern IntPtr CreateFontIndirect(ref LOGFONT lplf);

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    public static extern int DrawText(IntPtr hdc, string lpchText, int cchText, ref RECT lprc, uint dwDTFormat);

    [DllImport("gdi32.dll", CharSet = CharSet.Unicode)]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool GetTextExtentPoint32(IntPtr hdc, string lpString, int c, out SIZE psiz);

    [StructLayout(LayoutKind.Sequential)]
    public struct SIZE { public int cx, cy; }

    // ---- State ----
    public class State
    {
        public string phase = "executing";
        public string verb = "observe";
        public string target = "";
        public string elapsed = "00:00";
        public DateTime startTime = DateTime.Now;
        public DateTime lastUpdate = DateTime.Now;
        public bool hidden = false;
        public int barW = 340;
        public int barH = 38;
        public int radius = 19;
        public double animOffset = 0;
        public double perimeter = 0;
    }

    public class Palette
    {
        public int strokeR, strokeG, strokeB;
        public int pointR, pointG, pointB;
        public int chipBgR, chipBgG, chipBgB;
        public int chipFgR, chipFgG, chipFgB;
    }

    public static State S = new State();
    public static IntPtr HWND = IntPtr.Zero;
    private static WndProcDelegate wndProcKeepAlive;

    private static uint COLORREF(int r, int g, int b)
    {
        return (uint)((b << 16) | (g << 8) | r);
    }

    public static Palette PaletteFor(string phase)
    {
        Palette p = new Palette();
        switch (phase)
        {
            case "executing":
                p.strokeR=0x3B; p.strokeG=0x8A; p.strokeB=0xDD;
                p.pointR=0x18; p.pointG=0x5F; p.pointB=0xA5;
                p.chipBgR=0xE6; p.chipBgG=0xF1; p.chipBgB=0xFB;
                p.chipFgR=0x0C; p.chipFgG=0x44; p.chipFgB=0x7C;
                break;
            case "preview":
                p.strokeR=0xEF; p.strokeG=0x9F; p.strokeB=0x27;
                p.pointR=0xBA; p.pointG=0x75; p.pointB=0x17;
                p.chipBgR=0xFA; p.chipBgG=0xEE; p.chipBgB=0xDA;
                p.chipFgR=0x63; p.chipFgG=0x38; p.chipFgB=0x06;
                break;
            case "verified":
                p.strokeR=0x63; p.strokeG=0x99; p.strokeB=0x22;
                p.pointR=0x3B; p.pointG=0x6D; p.pointB=0x11;
                p.chipBgR=0xEA; p.chipBgG=0xF3; p.chipBgB=0xDE;
                p.chipFgR=0x27; p.chipFgG=0x50; p.chipFgB=0x0A;
                break;
            case "blocked":
                p.strokeR=0xE2; p.strokeG=0x4B; p.strokeB=0x4A;
                p.pointR=0xA3; p.pointG=0x2D; p.pointB=0x2D;
                p.chipBgR=0xFC; p.chipBgG=0xEB; p.chipBgB=0xEB;
                p.chipFgR=0x79; p.chipFgG=0x1F; p.chipFgB=0x1F;
                break;
            default: // unknown
                p.strokeR=0x88; p.strokeG=0x87; p.strokeB=0x80;
                p.pointR=0x5F; p.pointG=0x5E; p.pointB=0x5A;
                p.chipBgR=0xF1; p.chipBgG=0xEF; p.chipBgB=0xE8;
                p.chipFgR=0x44; p.chipFgG=0x44; p.chipFgB=0x41;
                break;
        }
        return p;
    }

    public static string ChipText(string phase)
    {
        if (phase == "executing") return "\u6267\u884C\u4E2D"; // 执行中
        if (phase == "preview")   return "\u9884\u544A";       // 预告
        if (phase == "verified")  return "\u5DF2\u9A8C\u8BC1"; // 已验证
        if (phase == "blocked")   return "\u5DF2\u963B\u6B62"; // 已阻止
        return "\u672A\u77E5";                               // 未知
    }

    private static bool ShouldAnimate()
    {
        return S.phase == "executing" || S.phase == "preview";
    }

    private static IntPtr CreateFont(string faceName, int size, int weight)
    {
        LOGFONT lf = new LOGFONT();
        lf.lfHeight = -Math.Abs((int)(size * 96 / 72));
        lf.lfWeight = weight == 0 ? 400 : weight;
        lf.lfCharSet = 1;
        lf.lfQuality = 0;
        lf.lfPitchAndFamily = 0;
        lf.lfFaceName = faceName;
        return CreateFontIndirect(ref lf);
    }

    private static void Paint(IntPtr hdc)
    {
        Palette c = PaletteFor(S.phase);
        SetBkMode(hdc, TRANSPARENT_BK);

        int barW = S.barW, barH = S.barH, radius = S.radius;

        // Background: white rounded rect
        IntPtr whiteBrush = CreateSolidBrush(COLORREF(255, 255, 255));
        IntPtr borderPen  = CreatePen(PS_SOLID, 1, COLORREF(200, 200, 200));
        IntPtr oldPen = SelectObject(hdc, borderPen);
        IntPtr oldBrush = SelectObject(hdc, whiteBrush);
        RoundRect(hdc, 1, 1, barW - 1, barH - 1, radius * 2, radius * 2);
        SelectObject(hdc, oldBrush);
        SelectObject(hdc, oldPen);
        DeleteObject(whiteBrush);
        DeleteObject(borderPen);

        // Border stroke
        uint strokeColor = COLORREF(c.strokeR, c.strokeG, c.strokeB);
        if (ShouldAnimate() || S.phase == "verified" || S.phase == "blocked")
        {
            IntPtr sp = CreatePen(PS_SOLID, 2, strokeColor);
            IntPtr op = SelectObject(hdc, sp);
            RoundRect(hdc, 1, 1, barW - 1, barH - 1, radius * 2, radius * 2);
            SelectObject(hdc, op);
            DeleteObject(sp);
        }
        else
        {
            IntPtr dp = CreatePen(PS_DASH, 1, strokeColor);
            IntPtr op = SelectObject(hdc, dp);
            RoundRect(hdc, 1, 1, barW - 1, barH - 1, radius * 2, radius * 2);
            SelectObject(hdc, op);
            DeleteObject(dp);
        }

        // Status dot (9px)
        IntPtr dotBrush = CreateSolidBrush(COLORREF(c.pointR, c.pointG, c.pointB));
        int dotX = 18, dotY = barH / 2 - 4;
        IntPtr ob = SelectObject(hdc, dotBrush);
        Ellipse(hdc, dotX, dotY, dotX + 9, dotY + 9);
        SelectObject(hdc, ob);
        DeleteObject(dotBrush);

        // Status chip
        string chipStr = ChipText(S.phase);
        IntPtr chipFont = CreateFont("Microsoft YaHei UI", 9, 0);
        IntPtr oldFont = SelectObject(hdc, chipFont);

        SIZE chipSize;
        GetTextExtentPoint32(hdc, chipStr, chipStr.Length, out chipSize);

        int chipX = dotX + 20;
        int chipY = (barH - chipSize.cy) / 2;
        int chipW = chipSize.cx + 10;
        int chipH = chipSize.cy;

        IntPtr chipBgBrush = CreateSolidBrush(COLORREF(c.chipBgR, c.chipBgG, c.chipBgB));
        IntPtr chipPen = CreatePen(PS_SOLID, 1, COLORREF(c.chipBgR, c.chipBgG, c.chipBgB));
        IntPtr op2 = SelectObject(hdc, chipPen);
        IntPtr ob2 = SelectObject(hdc, chipBgBrush);
        RoundRect(hdc, chipX, chipY, chipX + chipW, chipY + chipH, 8, 8);
        SelectObject(hdc, ob2);
        SelectObject(hdc, op2);
        DeleteObject(chipBgBrush);
        DeleteObject(chipPen);

        SetTextColor(hdc, COLORREF(c.chipFgR, c.chipFgG, c.chipFgB));
        SetTextAlign(hdc, TA_CENTER);
        RECT chipRect = new RECT { Left = chipX, Top = chipY, Right = chipX + chipW, Bottom = chipY + chipH };
        DrawText(hdc, chipStr, chipStr.Length, ref chipRect, DT_SINGLELINE | DT_VCENTER | DT_NOCLIP);
        SelectObject(hdc, oldFont);
        DeleteObject(chipFont);

        // Separator
        int sepX = chipX + chipW + 8;
        IntPtr sepPen = CreatePen(PS_SOLID, 1, COLORREF(220, 220, 220));
        IntPtr op3 = SelectObject(hdc, sepPen);
        MoveToEx(hdc, sepX, 10, IntPtr.Zero);
        LineTo(hdc, sepX, barH - 10);
        SelectObject(hdc, op3);
        DeleteObject(sepPen);

        // Action name (monospace)
        string actionText = S.verb;
        if (!string.IsNullOrEmpty(S.target))
        {
            string t = S.target;
            if (t.Length > 30) t = t.Substring(0, 30) + "\u2026";
            actionText = actionText + " \u00B7 " + t;
        }
        IntPtr monoFont = CreateFont("Consolas", 9, 0);
        IntPtr oldF2 = SelectObject(hdc, monoFont);
        SetTextAlign(hdc, TA_LEFT);
        SetTextColor(hdc, COLORREF(51, 51, 51));
        RECT actionRect = new RECT { Left = sepX + 8, Top = 0, Right = barW - 60, Bottom = barH };
        DrawText(hdc, actionText, actionText.Length, ref actionRect, DT_SINGLELINE | DT_VCENTER | DT_NOCLIP);
        SelectObject(hdc, oldF2);
        DeleteObject(monoFont);

        // Timer (right-aligned)
        IntPtr timerFont = CreateFont("Consolas", 9, 0);
        IntPtr oldF3 = SelectObject(hdc, timerFont);
        SetTextAlign(hdc, TA_RIGHT);
        SetTextColor(hdc, COLORREF(128, 128, 128));
        RECT timerRect = new RECT { Left = barW - 70, Top = 0, Right = barW - 14, Bottom = barH };
        DrawText(hdc, S.elapsed, S.elapsed.Length, ref timerRect, DT_SINGLELINE | DT_VCENTER | DT_NOCLIP);
        SelectObject(hdc, oldF3);
        DeleteObject(timerFont);
    }

    private static IntPtr WndProc(IntPtr hwnd, uint msg, IntPtr wParam, IntPtr lParam)
    {
        if (msg == WM_APP_SHOW || msg == WM_APP_HIDE)
        {
            Console.Error.WriteLine("[status-bar] WndProc got 0x" + msg.ToString("X"));
        }
        switch (msg)
        {
            case WM_PAINT:
            {
                PAINTSTRUCT ps;
                IntPtr hdc = BeginPaint(hwnd, out ps);
                Paint(hdc);
                EndPaint(hwnd, ref ps);
                return IntPtr.Zero;
            }
            case WM_TIMER:
            {
                long timerId = wParam.ToInt64();
                if (timerId == TIMER_ANIMATE)
                {
                    S.animOffset = (S.animOffset + 12.0) % (S.perimeter > 0 ? S.perimeter : 1);
                    if (ShouldAnimate())
                    {
                        RECT r = new RECT { Left = 0, Top = 0, Right = S.barW, Bottom = S.barH };
                        InvalidateRect(hwnd, ref r, false);
                    }
                }
                else if (timerId == TIMER_HEARTBEAT)
                {
                    double elapsed = (DateTime.Now - S.lastUpdate).TotalMilliseconds;
                    if (elapsed >= 3000)
                    {
                        if (!S.hidden) { PostMessage(hwnd, WM_APP_HIDE, IntPtr.Zero, IntPtr.Zero); S.hidden = true; }
                    }
                    else if (elapsed >= 2000)
                    {
                        if (S.phase != "unknown")
                        {
                            S.phase = "unknown";
                            RECT r = new RECT { Left = 0, Top = 0, Right = S.barW, Bottom = S.barH };
                            InvalidateRect(hwnd, ref r, false);
                        }
                    }
                    if (ShouldAnimate())
                    {
                        TimeSpan ts = DateTime.Now - S.startTime;
                        S.elapsed = string.Format("{0:00}:{1:00}", (int)ts.TotalMinutes, (int)ts.Seconds % 60);
                        RECT r = new RECT { Left = 0, Top = 0, Right = S.barW, Bottom = S.barH };
                        InvalidateRect(hwnd, ref r, false);
                    }
                }
                return IntPtr.Zero;
            }
            case WM_GETOBJECT:
                // Return empty - keep window out of the UIA observation tree
                return IntPtr.Zero;
            case WM_APP_SHOW:
            {
                // Runs on the window's own thread, inside the message pump
                ShowWindow(hwnd, SW_SHOWNOACTIVATE);
                SetWindowPos(hwnd, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE);
                RECT r = new RECT { Left = 0, Top = 0, Right = S.barW, Bottom = S.barH };
                InvalidateRect(hwnd, ref r, false);
                return IntPtr.Zero;
            }
            case WM_APP_HIDE:
            {
                ShowWindow(hwnd, SW_HIDE);
                return IntPtr.Zero;
            }
            case WM_DESTROY:
                KillTimer(hwnd, (IntPtr)TIMER_ANIMATE);
                KillTimer(hwnd, (IntPtr)TIMER_HEARTBEAT);
                PostQuitMessage(0);
                return IntPtr.Zero;
        }
        return DefWindowProc(hwnd, msg, wParam, lParam);
    }

    public static int Create()
    {
        SetProcessDPIAware();

        int screenW = GetSystemMetrics(SM_CXSCREEN);
        int screenH = GetSystemMetrics(SM_CYSCREEN);

        const int barW = 340, barH = 38, radius = 19;
        int x = (screenW - barW) / 2;
        int y = 12;

        S.barW = barW; S.barH = barH; S.radius = radius;
        S.perimeter = 2 * (barW - 2 * radius) + 2 * (barH - 2 * radius) + 2 * Math.PI * radius;

        string className = "AppUseStatusBar";
        IntPtr hInst = GetModuleHandle(null);

        wndProcKeepAlive = new WndProcDelegate(WndProc);

        WNDCLASSEX wc = new WNDCLASSEX();
        wc.cbSize = (uint)Marshal.SizeOf(typeof(WNDCLASSEX));
        wc.style = 0;
        wc.lpfnWndProc = Marshal.GetFunctionPointerForDelegate(wndProcKeepAlive);
        wc.hInstance = hInst;
        wc.hbrBackground = (IntPtr)(COLOR_WINDOW + 1);
        wc.lpszClassName = className;

        if (RegisterClassEx(ref wc) == 0)
        {
            int err = Marshal.GetLastWin32Error();
            Console.Error.WriteLine("[status-bar] RegisterClassEx failed, error=" + err);
            return 1;
        }

        uint exStyle = WS_EX_NOACTIVATE | WS_EX_TRANSPARENT | WS_EX_TOOLWINDOW | WS_EX_TOPMOST | WS_EX_LAYERED;
        uint style = WS_POPUP | WS_CLIPSIBLINGS | WS_CLIPCHILDREN | WS_VISIBLE;

        HWND = CreateWindowEx(exStyle, className, "", style, x, y, barW, barH,
            IntPtr.Zero, IntPtr.Zero, hInst, IntPtr.Zero);

        if (HWND == IntPtr.Zero)
        {
            int err = Marshal.GetLastWin32Error();
            Console.Error.WriteLine("[status-bar] CreateWindowEx failed, error=" + err);
            return 1;
        }

        SetLayeredWindowAttributes(HWND, COLORREF(255, 255, 255), 255, LWA_ALPHA);
        // Show from the window's own thread via the message queue
        PostMessage(HWND, WM_APP_SHOW, IntPtr.Zero, IntPtr.Zero);

        SetTimer(HWND, (IntPtr)TIMER_ANIMATE, 33, IntPtr.Zero);
        SetTimer(HWND, (IntPtr)TIMER_HEARTBEAT, 500, IntPtr.Zero);

        Console.WriteLine(string.Format("[status-bar] Native window created: hwnd=0x{0:X} pos=({1},{2}) size={3}x{4} exStyle=0x{5:X8}",
            HWND.ToInt64(), x, y, barW, barH, GetWindowLong(HWND, -20)));

        return 0;
    }

    // Apply an event coming from stdin
    public static void ApplyEvent(string phase, string verb, string target, bool resetTimer)
    {
        if (!string.IsNullOrEmpty(phase)) S.phase = phase;
        if (!string.IsNullOrEmpty(verb)) S.verb = verb;
        if (target != null) S.target = target;
        if (resetTimer) S.startTime = DateTime.Now;
        S.lastUpdate = DateTime.Now;
        S.hidden = false;
        if (HWND != IntPtr.Zero)
        {
            // Marshal the show/invalidate onto the window thread
            PostMessage(HWND, WM_APP_SHOW, IntPtr.Zero, IntPtr.Zero);
        }
    }

    public static void Stop()
    {
        if (HWND != IntPtr.Zero)
        {
            DestroyWindow(HWND);
            HWND = IntPtr.Zero;
        }
    }

    public static void RunMessageLoop()
    {
        MSG msg;
        while (true)
        {
            int ret = GetMessage(out msg, IntPtr.Zero, 0, 0);
            if (ret == 0) break;          // WM_QUIT
            if (ret == -1) break;         // error
            DispatchMessage(ref msg);
        }
    }

    // ------------------------------------------------------------------
    // Stdin reader (runs on a dedicated .NET thread — PowerShell script
    // blocks cannot be executed on threads without a runspace)
    // ------------------------------------------------------------------
    public class StatusEvent
    {
        public string phase { get; set; }
        public string verb { get; set; }
        public string target { get; set; }
        public int seq { get; set; }
    }

    private static void ReaderLoop()
    {
        try
        {
            StreamReader sr = new StreamReader(Console.OpenStandardInput(), Encoding.UTF8);
            JavaScriptSerializer ser = new JavaScriptSerializer();
            string line;
            while ((line = sr.ReadLine()) != null)
            {
                line = line.Trim();
                if (line.Length == 0) continue;
                try
                {
                    StatusEvent evt = ser.Deserialize<StatusEvent>(line);
                    if (evt == null) continue;
                    if (evt.phase == "stop" || evt.verb == "stop")
                    {
                        Stop();
                        return;
                    }
                    ApplyEvent(evt.phase, evt.verb, evt.target, evt.seq > 0);
                    Console.Error.WriteLine("[status-bar] applied event phase=" + evt.phase + " verb=" + evt.verb);
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine("[status-bar] event error: " + ex.Message);
                }
            }
            Stop();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine("[status-bar] reader error: " + ex.Message);
        }
    }

    public static void StartReader()
    {
        Thread t = new Thread(new ThreadStart(ReaderLoop));
        t.IsBackground = true;
        t.Start();
        Console.Error.WriteLine("[status-bar] reader thread started");
    }
}
'@

Add-Type -TypeDefinition $nativeSrc -Language CSharp -ReferencedAssemblies System.Web.Extensions
Write-Host "[status-bar] Native Win32 helper compiled"

# --- Create the overlay window ---
$rc = [AppUseStatusBar]::Create()
if ($rc -ne 0) { exit $rc }

# --- Stdin reader (dedicated .NET thread inside the native helper) ---
[AppUseStatusBar]::StartReader()

Write-Host "[status-bar] Entering message loop..."
[AppUseStatusBar]::RunMessageLoop()
Write-Host "[status-bar] Message loop exited."
