param(
    [Parameter(Mandatory)][ValidateSet('list','launch-calculator','observe','invoke')][string]$Action,
    [long]$WindowId,
    [int]$ProcessId,
    [string]$Screenshot,
    [string]$ControlId,
    [string]$FeedbackEvents
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
Add-Type -AssemblyName UIAutomationClient, UIAutomationTypes, System.Drawing
Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class FrankBotWindows {
    [DllImport("user32.dll")] public static extern bool SetProcessDpiAwarenessContext(IntPtr context);
    [DllImport("user32.dll")] public static extern uint GetDpiForWindow(IntPtr hwnd);
    [StructLayout(LayoutKind.Sequential)]
    public struct Rect { public int Left, Top, Right, Bottom; }
    [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
    [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hwnd);
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hwnd);
    [DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr hwnd, int command);
    [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr hwnd);
    [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hwnd, out Rect rect);
    [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hwnd, out int pid);
    [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr hwnd, IntPtr dc, uint flags);
}
'@
if (-not [FrankBotWindows]::SetProcessDpiAwarenessContext([IntPtr](-4))) {
    [void][FrankBotWindows]::SetProcessDPIAware()
}
$root = [Windows.Automation.AutomationElement]::RootElement
$scope = [Windows.Automation.TreeScope]
$any = [Windows.Automation.Condition]::TrueCondition

if ($Action -eq 'launch-calculator') {
    Start-Process -FilePath (Join-Path $env:SystemRoot 'System32/calc.exe')
    $Action = 'list'
    Start-Sleep -Milliseconds 800
}
if ($Action -eq 'list') {
    $windows = foreach ($element in $root.FindAll($scope::Children, $any)) {
        $window = $element.Current
        $handle = [IntPtr]$window.NativeWindowHandle
        if ($handle -ne [IntPtr]::Zero -and $window.Name -and [FrankBotWindows]::IsWindowVisible($handle)) {
            $owner = 0
            [void][FrankBotWindows]::GetWindowThreadProcessId($handle, [ref]$owner)
            [pscustomobject]@{ windowId = $handle.ToInt64(); processId = $owner; title = $window.Name }
        }
    }
    ConvertTo-Json -InputObject @($windows) -Compress
    return
}

if ($WindowId -le 0 -or $ProcessId -le 0) { throw 'Use a window ID and process ID returned by list.' }
$handle = [IntPtr]$WindowId
$owner = 0
[void][FrankBotWindows]::GetWindowThreadProcessId($handle, [ref]$owner)
if ($owner -ne $ProcessId -or -not [FrankBotWindows]::IsWindowVisible($handle)) {
    throw 'The bound window is unavailable. List and select again.'
}
$target = [Windows.Automation.AutomationElement]::FromHandle($handle)

if ($Action -eq 'invoke') {
    if (-not $ControlId) { throw 'Provide a control ID returned by observe.' }
    $condition = [Windows.Automation.PropertyCondition]::new(
        [Windows.Automation.AutomationElement]::AutomationIdProperty, $ControlId
    )
    $matches = @($target.FindAll($scope::Descendants, $condition) |
        Where-Object { $_.Current.IsEnabled -and -not $_.Current.IsOffscreen })
    if ($matches.Count -ne 1) { throw 'The control is missing or ambiguous. Observe again.' }
    $pattern = $null
    if (-not $matches[0].TryGetCurrentPattern([Windows.Automation.InvokePattern]::Pattern, [ref]$pattern)) {
        throw 'The control does not support Invoke.'
    }
    if ($FeedbackEvents) {
        $control = $matches[0].Current
        $bounds = $control.BoundingRectangle
        $rect = New-Object FrankBotWindows+Rect
        if (-not $bounds.IsEmpty -and [FrankBotWindows]::GetWindowRect($handle, [ref]$rect)) {
            $event = @{
                phase = 'focus'; message = "正在操作「$($control.Name)」"
                x = $bounds.Left - $rect.Left; y = $bounds.Top - $rect.Top
                width = $bounds.Width; height = $bounds.Height
                windowWidth = $rect.Right - $rect.Left; windowHeight = $rect.Bottom - $rect.Top
                dpi = [FrankBotWindows]::GetDpiForWindow($handle)
            }
            [IO.File]::AppendAllText($FeedbackEvents, ($event | ConvertTo-Json -Compress) + [Environment]::NewLine)
            Start-Sleep -Milliseconds 250
        }
    }
    $pattern.Invoke()
    if ($FeedbackEvents) {
        $event = @{ phase = 'pressed'; message = "已操作「$($matches[0].Current.Name)」" }
        [IO.File]::AppendAllText($FeedbackEvents, ($event | ConvertTo-Json -Compress) + [Environment]::NewLine)
    }
    @{ invoked = $ControlId; windowId = $WindowId } | ConvertTo-Json -Compress
    return
}

if (-not $Screenshot) { throw 'Provide a screenshot output path.' }
if ([FrankBotWindows]::IsIconic($handle)) {
    [void][FrankBotWindows]::ShowWindowAsync($handle, 9)
}
[void][FrankBotWindows]::SetForegroundWindow($handle)
$rect = New-Object FrankBotWindows+Rect
if (-not [FrankBotWindows]::GetWindowRect($handle, [ref]$rect)) { throw 'Cannot read window bounds.' }
$bitmap = [Drawing.Bitmap]::new(($rect.Right - $rect.Left), ($rect.Bottom - $rect.Top))
try {
    $graphics = [Drawing.Graphics]::FromImage($bitmap)
    try {
        $dc = $graphics.GetHdc()
        try { $captured = [FrankBotWindows]::PrintWindow($handle, $dc, 2) }
        finally { $graphics.ReleaseHdc($dc) }
        if (-not $captured) { throw 'Window capture failed.' }
    } finally { $graphics.Dispose() }
    $scale = [Math]::Min(1.0, 1500.0 / [Math]::Max($bitmap.Width, $bitmap.Height))
    $scaled = [Drawing.Bitmap]::new($bitmap, [int]($bitmap.Width * $scale), [int]($bitmap.Height * $scale))
    try { $scaled.Save($Screenshot, [Drawing.Imaging.ImageFormat]::Png) }
    finally { $scaled.Dispose() }
} finally { $bitmap.Dispose() }

$controls = foreach ($element in $target.FindAll($scope::Descendants, $any)) {
    $control = $element.Current
    if ($control.IsOffscreen -or -not $control.Name) { continue }
    $pattern = $null
    [pscustomobject]@{
        id = $control.AutomationId
        name = $control.Name
        invokable = [bool]($control.IsEnabled -and $control.AutomationId -and
            $element.TryGetCurrentPattern([Windows.Automation.InvokePattern]::Pattern, [ref]$pattern))
    }
}
@{ windowId = $WindowId; processId = $ProcessId; title = $target.Current.Name;
   screenshot = $Screenshot; controls = @($controls) } | ConvertTo-Json -Depth 4 -Compress
