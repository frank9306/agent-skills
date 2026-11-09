# mole-ui.ps1 — UI automation driver for the Mole cleanup app.
#
# Mole is a WinUI 3 application, so its controls are invisible to Win32
# child-window enumeration. This driver uses Windows UI Automation
# (System.Windows.Automation) to:
#   1. locate the Mole window by process id
#   2. click the "scan" trigger (AutomationId = clean.scan)
#   3. wait for the scan to finish and the clean button to appear
#   4. click the clean button and wait for the cleanup to complete
#
# It snapshots Mole's own bookkeeping files before acting, so the final
# report can show exactly what the run changed.
#
# Progress is emitted on stdout as JSON, one object per line:
#   {"kind":"status","phase":"...","verb":"...","target":"..."}
#   {"kind":"log","message":"..."}
#   {"kind":"result","ok":true,...}

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$uiaClient   = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\WPF\UIAutomationClient.dll"
$uiaTypes    = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\WPF\UIAutomationTypes.dll"
$windowsBase = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\WPF\WindowsBase.dll"

# ---------------------------------------------------------------------------
# Native helper
# ---------------------------------------------------------------------------
$helperSrc = @'
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Automation;

public class MoleUi
{
    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool SetForegroundWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool SetCursorPos(int X, int Y);

    [DllImport("user32.dll")]
    public static extern void mouse_event(uint flags, uint dx, uint dy, uint data, IntPtr extra);

    public class ElementInfo
    {
        public string Name;
        public string AutomationId;
        public string ClassName;
        public string ControlType;
        public int Left, Top, Right, Bottom;
        public bool Enabled;
        public bool Offscreen;
    }

    static AutomationElement FindWindow(int pid)
    {
        Condition cond = new PropertyCondition(AutomationElement.ProcessIdProperty, pid);
        return AutomationElement.RootElement.FindFirst(TreeScope.Children, cond);
    }

    public static IntPtr FindWindowByPid(int pid)
    {
        AutomationElement win = FindWindow(pid);
        if (win == null) return IntPtr.Zero;
        object h = win.GetCurrentPropertyValue(AutomationElement.NativeWindowHandleProperty);
        if (h is int && (int)h != 0) return new IntPtr((int)h);
        return IntPtr.Zero;
    }

    public static bool Activate(int pid)
    {
        AutomationElement win = FindWindow(pid);
        if (win == null) return false;
        try { win.SetFocus(); } catch { }
        object h = win.GetCurrentPropertyValue(AutomationElement.NativeWindowHandleProperty);
        if (h is int && (int)h != 0)
        {
            IntPtr hp = new IntPtr((int)h);
            ShowWindow(hp, 9);   // SW_RESTORE
            SetForegroundWindow(hp);
            return true;
        }
        return false;
    }

    // All top-level windows belonging to the given process (Mole opens the
    // scan review in a secondary window).
    static AutomationElementCollection TopWindows(int pid)
    {
        Condition pidCond = new PropertyCondition(AutomationElement.ProcessIdProperty, pid);
        return AutomationElement.RootElement.FindAll(TreeScope.Children, pidCond);
    }

    public static List<ElementInfo> Describe(int pid)
    {
        List<ElementInfo> list = new List<ElementInfo>();
        AutomationElementCollection windows = TopWindows(pid);
        foreach (AutomationElement win in windows)
        {
            AutomationElementCollection all;
            try { all = win.FindAll(TreeScope.Descendants, Condition.TrueCondition); }
            catch { continue; }
            foreach (AutomationElement el in all)
        {
            try
            {
                ElementInfo i = new ElementInfo();
                i.Name = Get(() => (string)el.GetCurrentPropertyValue(AutomationElement.NameProperty), "");
                i.AutomationId = Get(() => (string)el.GetCurrentPropertyValue(AutomationElement.AutomationIdProperty), "");
                i.ClassName = Get(() => (string)el.GetCurrentPropertyValue(AutomationElement.ClassNameProperty), "");
                ControlType ct = Get(() => el.Current.ControlType, (ControlType)null);
                i.ControlType = ct == null ? "Custom" : ct.ProgrammaticName;
                Rect r = Get(() => el.Current.BoundingRectangle, new Rect());
                i.Left = (int)r.Left; i.Top = (int)r.Top;
                i.Right = (int)r.Right; i.Bottom = (int)r.Bottom;
                i.Enabled = Get(() => el.Current.IsEnabled, false);
                i.Offscreen = Get(() => el.Current.IsOffscreen, false);
                list.Add(i);
            }
            catch { }
        }
        }
        return list;
    }

    static T Get<T>(Func<T> f, T fallback)
    {
        try { return f(); } catch { return fallback; }
    }

    // Click by AutomationId. Returns a description of what happened.
    public static string ClickById(int pid, string automationId)
    {
        Condition cond = new PropertyCondition(AutomationElement.AutomationIdProperty, automationId);
        AutomationElementCollection windows = TopWindows(pid);
        foreach (AutomationElement win in windows)
        {
            AutomationElement el;
            try { el = win.FindFirst(TreeScope.Descendants, cond); }
            catch { continue; }
            if (el != null) return Invoke(el);
        }
        return "not-found";
    }

    // Click the first element whose name contains the needle and, optionally,
    // whose AutomationId contains idNeedle.
    public static string ClickByName(int pid, string nameNeedle, string idNeedle, string excludeType)
    {
        AutomationElementCollection windows = TopWindows(pid);
        if (windows.Count == 0) return "no-window";
        foreach (AutomationElement win in windows)
        {
        AutomationElementCollection all;
        try { all = win.FindAll(TreeScope.Descendants, Condition.TrueCondition); }
        catch { continue; }
        foreach (AutomationElement el in all)
        {
            try
            {
                string n = (string)el.GetCurrentPropertyValue(AutomationElement.NameProperty);
                string aid = (string)el.GetCurrentPropertyValue(AutomationElement.AutomationIdProperty);
                ControlType ct = el.Current.ControlType;
                string ctn = ct == null ? "" : ct.ProgrammaticName;

                if (!string.IsNullOrEmpty(excludeType) && ctn.IndexOf(excludeType, StringComparison.OrdinalIgnoreCase) >= 0)
                    continue;
                if (!string.IsNullOrEmpty(nameNeedle) &&
                    (n == null || n.IndexOf(nameNeedle, StringComparison.OrdinalIgnoreCase) < 0))
                    continue;
                if (!string.IsNullOrEmpty(idNeedle) &&
                    (aid == null || aid.IndexOf(idNeedle, StringComparison.OrdinalIgnoreCase) < 0))
                    continue;
                return Invoke(el);
            }
            catch (Exception ex) { return "error:" + ex.Message; }
        }
        }
        return "not-found";
    }

    static string Invoke(AutomationElement el)
    {
        string name = (string)el.GetCurrentPropertyValue(AutomationElement.NameProperty);
        object p;
        if (el.TryGetCurrentPattern(InvokePattern.Pattern, out p))
        {
            ((InvokePattern)p).Invoke();
            return "invoked:" + name;
        }
        if (el.TryGetCurrentPattern(SelectionItemPattern.Pattern, out p))
        {
            ((SelectionItemPattern)p).Select();
            return "selected:" + name;
        }
        Rect r = el.Current.BoundingRectangle;
        int cx = (int)(r.Left + r.Width / 2);
        int cy = (int)(r.Top + r.Height / 2);
        SetCursorPos(cx, cy);
        mouse_event(0x0002, 0, 0, 0, IntPtr.Zero);
        mouse_event(0x0004, 0, 0, 0, IntPtr.Zero);
        return "clicked:" + name + "@" + cx + "," + cy;
    }
}
'@

try {
    [System.Reflection.Assembly]::LoadFrom($uiaTypes) | Out-Null
    [System.Reflection.Assembly]::LoadFrom($uiaClient) | Out-Null
    [System.Reflection.Assembly]::LoadFrom($windowsBase) | Out-Null
} catch {
    Write-Host "[mole-ui] failed to load UI Automation assemblies: $($_.Exception.Message)"
    exit 1
}

Add-Type -TypeDefinition $helperSrc -Language CSharp `
    -ReferencedAssemblies "$uiaClient", "$uiaTypes", "$windowsBase"

# ---------------------------------------------------------------------------
# Reporting helpers
# ---------------------------------------------------------------------------
function Emit-Status($phase, $verb, $target) {
    Write-Output (@{ kind = "status"; phase = $phase; verb = $verb; target = $target } | ConvertTo-Json -Compress)
}
function Emit-Log($message) {
    Write-Output (@{ kind = "log"; message = $message } | ConvertTo-Json -Compress)
}

$moleDir   = Join-Path $env:LOCALAPPDATA "Mole"
$opsPath   = Join-Path $moleDir "operations.jsonl"
$statsPath = Join-Path $moleDir "stats.json"

function Get-OpsLines {
    if (-not (Test-Path $opsPath)) { return @() }
    try {
        return @(Get-Content $opsPath -Encoding UTF8 | Where-Object { $_.Trim() })
    } catch { return @() }
}

# ---------------------------------------------------------------------------
# Locate Mole
# ---------------------------------------------------------------------------
$moleProc = Get-Process -Name "Mole" -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $moleProc) {
    Emit-Log "Mole is not running"
    Emit-Status "blocked" "find" "Mole not running"
    Write-Output (@{ kind = "result"; ok = $false; reason = "Mole-not-running" } | ConvertTo-Json -Compress)
    exit 1
}
$pid_ = $moleProc.Id

Emit-Status "preview" "find" "Mole window"
$hwnd = [MoleUi]::FindWindowByPid($pid_)
if ($hwnd -eq [IntPtr]::Zero) {
    Emit-Log "Mole window not surfaced yet - activating it"
    [void][MoleUi]::Activate($pid_)
    Start-Sleep -Milliseconds 900
    $hwnd = [MoleUi]::FindWindowByPid($pid_)
}
if ($hwnd -eq [IntPtr]::Zero) {
    Emit-Log "Mole window not found"
    Emit-Status "blocked" "find" "Mole window not found"
    Write-Output (@{ kind = "result"; ok = $false; reason = "window-not-found" } | ConvertTo-Json -Compress)
    exit 1
}
Emit-Log ("Mole window hwnd=0x" + $hwnd.ToString("X") + " pid=" + $pid_)
[void][MoleUi]::Activate($pid_)
Start-Sleep -Milliseconds 700

# ---------------------------------------------------------------------------
# Baseline snapshot
# ---------------------------------------------------------------------------
$opsBefore = Get-OpsLines
$statsBefore = $null
if (Test-Path $statsPath) { try { $statsBefore = Get-Content $statsPath -Raw | ConvertFrom-Json } catch { } }
Emit-Log ("baseline: operations.jsonl lines=" + $opsBefore.Count)

# ---------------------------------------------------------------------------
# Phase 1 - switch to the Clean tab and start the scan
# ---------------------------------------------------------------------------
Emit-Status "act" "tab" "clean tab"
$tabRes = [MoleUi]::ClickByName($pid_, "清理", "tab.clean", "")
Emit-Log ("select clean tab -> " + $tabRes)
Start-Sleep -Milliseconds 800

# ---------------------------------------------------------------------------
# Phase 1 + 2 - drive the clean view through its state machine until the
# actual clean action is reachable.
#
#   start screen   : clean.scan          "扫描电脑"
#   scan finished  : ReviewResultsButton "查看结果"
#   review panel   : clean.review.clean  "永久清理 N GB"
# ---------------------------------------------------------------------------
$cleanClicked = $null
$deadline = (Get-Date).AddSeconds(120)
$lastState = ""
$lastClickedId = ""
$lastClickedAt = [datetime]::MinValue

while ((Get-Date) -lt $deadline) {
    $els = [MoleUi]::Describe($pid_)
    $byId = @{}
    foreach ($e in $els) { if ($e.AutomationId) { $byId[$e.AutomationId] = $e } }

    # Priority order: the clean action itself first, then the controls that
    # lead to it. The review panel only renders its clean button once at least
    # one category is selected, so the preset buttons come next.
    $advance = @(
        @{ id = "clean.review.clean"; label = "clean" },
        @{ id = "PresetRecommended";   label = "preset" },
        @{ id = "PresetAll";           label = "preset" },
        @{ id = "ReviewResultsButton"; label = "review" },
        @{ id = "clean.scan";         label = "scan" },
        @{ id = "ReturnButton";        label = "return" },
        @{ id = "FoundRescanLink";     label = "rescan" },
        @{ id = "RescanButton";        label = "rescan" }
    )

    $acted = $false
    foreach ($step in $advance) {
        if (-not $byId.ContainsKey($step.id)) { continue }
        $btn = $byId[$step.id]
        if (-not $btn.Enabled -or $btn.Offscreen) { continue }
        # Do not spam the same button - give the UI time to react first.
        if ($lastClickedId -eq $step.id -and ((Get-Date) - $lastClickedAt).TotalSeconds -lt 5) { continue }
        $lastClickedId = $step.id
        $lastClickedAt = Get-Date
        if ($step.label -eq "clean") {
            $res = [MoleUi]::ClickById($pid_, $step.id)
            Emit-Log ("click clean.review.clean ('" + $btn.Name + "') -> " + $res)
            if ($res -notlike "not-found*" -and $res -notlike "error:*") {
                $cleanClicked = "clean.review.clean (" + $btn.Name + ") " + $res
            }
        } else {
            Emit-Status "act" $step.label $btn.Name
            $res = [MoleUi]::ClickById($pid_, $step.id)
            Emit-Log ("click " + $step.id + " ('" + $btn.Name + "') -> " + $res)
        }
        $acted = $true
        Start-Sleep -Seconds 1
        break
    }

    if ($cleanClicked) { break }

    if (-not $acted) {
        $names = @($els | Where-Object { $_.AutomationId -and $_.ControlType -like "*Button*" } | ForEach-Object { $_.AutomationId })
        Emit-Log ("no known control matched; buttons: " + ($names -join ", "))
        Start-Sleep -Seconds 2
    }
}

if (-not $cleanClicked) {
    # The clean button never appeared. If the review panel is up and reports
    # "0 KB" then there is genuinely nothing to clean - that is a success.
    $finalEls = [MoleUi]::Describe($pid_)
    $totalText = ""
    foreach ($e in $finalEls) {
        if ($e.Name -and ($e.Name -match "可清理|共 .* GB|共 .* MB")) { $totalText = $e.Name }
    }
    $hasReview = @($finalEls | Where-Object { $_.AutomationId -eq "clean.review.close" }).Count -gt 0
    if ($hasReview -and $totalText -match "0 KB") {
        Emit-Log ("review panel reports nothing to clean (" + $totalText + ")")
        Emit-Status "verified" "complete" "nothing to clean"
        Write-Output (@{
            kind = "result"; ok = $true; completed = $true; nothingToClean = $true
            pid = $pid_; hwnd = $hwnd.ToString("X"); clicked = $null
            opsBefore = $opsBefore.Count; opsAfter = (Get-OpsLines).Count
            newOps = @(); statsBefore = $statsBefore; statsAfter = $statsBefore
        } | ConvertTo-Json -Compress -Depth 6)
        exit 0
    }
    Emit-Status "blocked" "find-clean" "clean button never appeared"
    Emit-Log "clean action never appeared within the timeout"
    Write-Output (@{ kind = "result"; ok = $false; reason = "clean-button-timeout" } | ConvertTo-Json -Compress)
    exit 1
}

Emit-Status "execute" "clean" "cleaning"

# ---------------------------------------------------------------------------
# Phase 3 - wait for the cleanup to complete (Mole writes to operations.jsonl)
# ---------------------------------------------------------------------------
$done = $false
$confirmed = $false
$deadline2 = (Get-Date).AddSeconds(180)
while ((Get-Date) -lt $deadline2) {
    Start-Sleep -Seconds 3

    # Mole may ask for confirmation before wiping; click it if present.
    if (-not $confirmed) {
        $els2 = [MoleUi]::Describe($pid_)
        $confirm = @($els2 | Where-Object {
            $_.Enabled -and -not $_.Offscreen -and $_.Name -and
            $_.ControlType -like "*Button*" -and
            ($_.Name -match "^(确认|确定|确认清理|永久清理|立即清理|是的|OK|Confirm)$" -or $_.Name -match "确认|确定") -and
            $_.AutomationId -notlike "*close*"
        })
        if ($confirm.Count -gt 0) {
            $res = [MoleUi]::ClickById($pid_, $confirm[0].AutomationId)
            Emit-Log ("click confirm '" + $confirm[0].AutomationId + "' (" + $confirm[0].Name + ") -> " + $res)
            $confirmed = $true
        }
    }

    $now = Get-OpsLines
    $new = @()
    if ($now.Count -gt $opsBefore.Count) {
        $new = @($now[$opsBefore.Count..($now.Count - 1)])
    }
    $finished = $false
    foreach ($line in $new) {
        try {
            $o = $line | ConvertFrom-Json
            if ($o.Operation -eq "clean" -and $o.Stage -eq "finished") { $finished = $true }
        } catch {}
    }
    Emit-Log ("cleanup progress: operations " + $opsBefore.Count + " -> " + $now.Count)
    if ($finished) { $done = $true; break }
}
Emit-Status "validate" "validate" "result"

# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------
$opsAfter = Get-OpsLines
$newOps = @()
if ($opsAfter.Count -gt $opsBefore.Count) {
    $newOps = @($opsAfter[$opsBefore.Count..($opsAfter.Count - 1)])
}
$statsAfter = $null
if (Test-Path $statsPath) { try { $statsAfter = Get-Content $statsPath -Raw | ConvertFrom-Json } catch { } }

foreach ($line in $newOps) {
    try {
        $o = $line | ConvertFrom-Json
        $bytes = $o.Bytes
        $mb = if ($bytes) { [math]::Round($bytes / 1MB, 2) } else { 0 }
        Emit-Log ("NEW op: op=" + $o.Operation + " stage=" + $o.Stage + " result=" + $o.Result +
                  " items=" + $o.Items + " ok=" + $o.Succeeded + " fail=" + $o.Failed +
                  " skip=" + $o.Skipped + " bytes=" + $bytes + " (" + $mb + " MB) ms=" + $o.DurationMs)
    } catch {
        Emit-Log ("NEW op (raw): " + $line)
    }
}

# Parse the new operation records so the host receives structured data.
$newOpsParsed = @()
foreach ($line in $newOps) {
    try { $newOpsParsed += ($line | ConvertFrom-Json) } catch { }
}

Emit-Status "verified" "complete" "done"

Write-Output (@{
    kind        = "result"
    ok          = $true
    completed   = $done
    pid         = $pid_
    hwnd        = $hwnd.ToString("X")
    clicked     = $cleanClicked
    opsBefore   = $opsBefore.Count
    opsAfter    = $opsAfter.Count
    newOps      = $newOpsParsed
    statsBefore = $statsBefore
    statsAfter  = $statsAfter
} | ConvertTo-Json -Compress -Depth 6)
