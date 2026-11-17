param(
    [Parameter(Mandatory)][ValidateSet('list','launch','launch-calculator','observe','window-state','focus','invoke','toggle','click','hover','type','key','scroll','drag','tray-open','tray-menu','tray-select')][string]$Action,
    [long]$WindowId,
    [int]$ProcessId,
    [string]$Screenshot,
    [string]$ControlId,
    [string]$ControlName,
    [string]$Observation,
    [int]$X = -1, [int]$Y = -1,
    [int]$ToX = -1, [int]$ToY = -1,
    [ValidateSet('left','right')][string]$MouseButton = 'left',
    [ValidateRange(1,3)][int]$ClickCount = 1,
    [int]$WheelDelta,
    [string]$TextFile,
    [string]$Text,
    [switch]$ReplaceText,
    [string]$Keys,
    [string]$Executable,
    [string]$TrayName,
    [uint32]$TrayIconId,
    [Guid]$TrayIconGuid = [Guid]::Empty,
    [long]$MenuId,
    [string]$MenuItem,
    [string]$FeedbackEvents,
    [string]$ControlType,
    [switch]$ControlsOnly,
    [switch]$AsyncFeedback,
    [switch]$NoFeedback
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
if (-not ('FrankBotWindows' -as [type])) {
Add-Type -AssemblyName UIAutomationClient, UIAutomationTypes, System.Drawing, System.Windows.Forms
Add-Type -Path (Join-Path $PSScriptRoot 'desktop-input.cs')
Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class FrankBotWindows {
    [DllImport("user32.dll")] public static extern bool SetProcessDpiAwarenessContext(IntPtr context);
    [DllImport("user32.dll")] public static extern uint GetDpiForWindow(IntPtr hwnd);
    [DllImport("user32.dll")] public static extern IntPtr GetWindowDpiAwarenessContext(IntPtr hwnd);
    [DllImport("user32.dll")] public static extern int GetAwarenessFromDpiAwarenessContext(IntPtr context);
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
}
$root = [Windows.Automation.AutomationElement]::RootElement
$scope = [Windows.Automation.TreeScope]
$any = [Windows.Automation.Condition]::TrueCondition

if ($Action -eq 'launch') {
    if (!$Executable) { throw 'Supply the authorized GUI executable path.' }
    $program = Get-Item -LiteralPath $Executable
    if ($program.PSIsContainer -or $program.Extension -ne '.exe') { throw 'Expected an executable file.' }
    $process = Start-Process -FilePath $program.FullName -WorkingDirectory $program.DirectoryName -PassThru
    @{ processId = $process.Id; executable = $program.FullName } | ConvertTo-Json -Compress
    return
}
if ($Action -eq 'launch-calculator') {
    Start-Process -FilePath (Join-Path $env:SystemRoot 'System32/calc.exe')
    $Action = 'list'
    Start-Sleep -Milliseconds 800
}
if ($Action -eq 'list') {
    $windowType = [Windows.Automation.PropertyCondition]::new(
        [Windows.Automation.AutomationElement]::ControlTypeProperty, [Windows.Automation.ControlType]::Window)
    $elements = @(foreach ($top in $root.FindAll($scope::Children, $any)) {
        $top
        foreach ($child in $top.FindAll($scope::Descendants, $windowType)) { $child }
    })
    $seen = @{}
    $windows = foreach ($element in $elements) {
        $window = $element.Current
        $handle = [IntPtr]$window.NativeWindowHandle
        if ($handle -ne [IntPtr]::Zero -and $window.Name -and [FrankBotWindows]::IsWindowVisible($handle) -and !$seen.ContainsKey($handle.ToInt64())) {
            $seen[$handle.ToInt64()] = $true
            $owner = 0
            [void][FrankBotWindows]::GetWindowThreadProcessId($handle, [ref]$owner)
            $process = Get-Process -Id $owner -ErrorAction SilentlyContinue
            [pscustomobject]@{ windowId = $handle.ToInt64(); processId = $owner; title = $window.Name; executable = $process.Path }
        }
    }
    ConvertTo-Json -InputObject @($windows) -Compress
    return
}

if ($WindowId -le 0 -or $ProcessId -le 0) { throw 'Use a window ID and process ID returned by list.' }
$handle = [IntPtr]$WindowId
$owner = 0
[void][FrankBotWindows]::GetWindowThreadProcessId($handle, [ref]$owner)
if ($owner -ne $ProcessId -or -not [FrankBotInput]::IsWindow($handle)) {
    throw 'The bound window is unavailable. List and select again.'
}
$target = [Windows.Automation.AutomationElement]::FromHandle($handle)

function Get-Rect {
    $current = New-Object FrankBotWindows+Rect
    if (![FrankBotWindows]::GetWindowRect($handle, [ref]$current)) { throw 'Cannot read window bounds.' }
    $current
}

function Find-Control([switch]$Editable) {
    if (($ControlId -and $ControlName) -or (!$ControlId -and !$ControlName)) {
        throw 'Supply exactly one ControlId or ControlName from the current observation.'
    }
    $property = if ($ControlId) { [Windows.Automation.AutomationElement]::AutomationIdProperty } else { [Windows.Automation.AutomationElement]::NameProperty }
    $value = if ($ControlId) { $ControlId } else { $ControlName }
    $condition = [Windows.Automation.PropertyCondition]::new($property, $value)
    $matches = @($target.FindAll($scope::Descendants, $condition) | Where-Object {
        $_.Current.IsEnabled -and !$_.Current.IsOffscreen -and
            (!$ControlType -or $_.Current.ControlType.ProgrammaticName -eq "ControlType.$ControlType") -and (!$Editable -or $_.Current.ControlType -eq [Windows.Automation.ControlType]::Edit)
    })
    if ($matches.Count -ne 1) { throw "Expected one visible, enabled control matching '$value', found $($matches.Count)." }
    $matches[0]
}

function New-Point([int]$Left, [int]$Top) {
    $point = New-Object FrankBotInput+Point
    $point.X = $Left
    $point.Y = $Top
    $point
}

function Assert-Hit($Point, [IntPtr]$Window) {
    $hit = [FrankBotInput]::WindowFromPoint($Point)
    if ($hit -eq [IntPtr]::Zero -or [FrankBotInput]::GetAncestor($hit, 2) -ne $Window) {
        throw "Target point ($($Point.X),$($Point.Y)) is covered or belongs to a different window (hit=$hit, root=$([FrankBotInput]::GetAncestor($hit, 2)), foreground=$([FrankBotInput]::GetForegroundWindow()), expected=$Window). Observe again."
    }
}

function Get-WindowPoint([int]$Column, [int]$Row, [switch]$Editable) {
    if ($Column -lt 0 -and $Row -lt 0) {
        $control = Find-Control -Editable:$Editable
        $bounds = $control.Current.BoundingRectangle
        if ($bounds.IsEmpty -or $bounds.Width -le 0 -or $bounds.Height -le 0) { throw 'Control has no usable bounds.' }
        return New-Point ([int]($bounds.Left + $bounds.Width / 2)) ([int]($bounds.Top + $bounds.Height / 2))
    }
    if (!$Observation -or $ControlId -or $ControlName) { throw 'Screenshot coordinates require the observation JSON and exclude control selectors.' }
    $snapshot = Get-Content -LiteralPath $Observation -Raw -Encoding utf8 | ConvertFrom-Json
    $rect = Get-Rect
    if ($snapshot.windowId -ne $WindowId -or $snapshot.processId -ne $ProcessId -or
        $snapshot.bounds.left -ne $rect.Left -or $snapshot.bounds.top -ne $rect.Top -or
        $snapshot.bounds.width -ne ($rect.Right - $rect.Left) -or $snapshot.bounds.height -ne ($rect.Bottom - $rect.Top)) {
        throw 'The observed window or size changed. Observe again.'
    }
    if ($Column -lt 0 -or $Row -lt 0 -or $Column -ge $snapshot.imageWidth -or $Row -ge $snapshot.imageHeight) {
        throw 'Coordinates must lie within the observed screenshot.'
    }
    New-Point ($rect.Left + [int][Math]::Floor($Column * $snapshot.bounds.width / $snapshot.imageWidth)) `
        ($rect.Top + [int][Math]::Floor($Row * $snapshot.bounds.height / $snapshot.imageHeight))
}

function Read-TrayMenu([long]$Expected) {
    $condition = [Windows.Automation.PropertyCondition]::new(
        [Windows.Automation.AutomationElement]::ProcessIdProperty, $ProcessId)
    $menus = @($root.FindAll($scope::Children, $condition) | Where-Object {
        $_.Current.ClassName -eq '#32768' -and !$_.Current.IsOffscreen
    })
    if ($menus.Count -ne 1) { throw 'Expected one visible native popup menu owned by the bound process.' }
    $popup = [IntPtr]$menus[0].Current.NativeWindowHandle
    if ($Expected -and $Expected -ne $popup.ToInt64()) { throw 'The observed menu changed. Observe the tray menu again.' }
    @{ id = $popup.ToInt64(); items = @([FrankBotInput]::Menu($popup)) }
}

function Record-Feedback([string]$Phase,[string]$Message,$Point) {
    if (!$FeedbackEvents -or $NoFeedback) { return }
    $event = @{ phase=$Phase; message=$Message }
    if ($null -ne $Point -and $Phase -eq 'focus') {
        $windowRect=Get-Rect
        $size=[int][Math]::Max(12, 20*[FrankBotWindows]::GetDpiForWindow($handle)/96)
        $event.x=[int]($Point.X-$windowRect.Left-$size/2)
        $event.y=[int]($Point.Y-$windowRect.Top-$size/2)
        $event.width=$size
        $event.height=$size
        $event.windowWidth=$windowRect.Right-$windowRect.Left
        $event.windowHeight=$windowRect.Bottom-$windowRect.Top
        $event.dpi=[FrankBotWindows]::GetDpiForWindow($handle)
    }
    [IO.File]::AppendAllText($FeedbackEvents, ($event | ConvertTo-Json -Compress) + [Environment]::NewLine)
}

$standalone=$false
if (!$NoFeedback -and !$FeedbackEvents -and $Action -in 'click','hover','scroll','drag','type','key','invoke','toggle','tray-open','tray-menu','tray-select') {
    $standalone=$true
    $FeedbackEvents=Join-Path ([IO.Path]::GetTempPath()) ('franks-bot-'+[Guid]::NewGuid().ToString('N')+'.jsonl')
    $ready=$FeedbackEvents+'.ready'
    Record-Feedback 'observe' 'franks-bot 正在操作' $null
    $feedbackScript=Join-Path $PSScriptRoot 'feedback.ps1'
    $tick=[Diagnostics.Stopwatch]::GetTimestamp()
    $overlay=Start-Process -FilePath powershell.exe -WindowStyle Hidden -PassThru -ArgumentList @(
        '-NoProfile','-STA','-File',('"' + $feedbackScript + '"'),'-Events',('"' + $FeedbackEvents + '"'),
        '-WindowId',"$WindowId",'-OwnerId',"$ProcessId",'-StartedTick',"$tick",'-ReadyFile',('"' + $ready + '"'),'-Transient'
    )
    for($i=0;$i -lt 25 -and !$overlay.HasExited -and !(Test-Path -LiteralPath $ready);$i++){Start-Sleep -Milliseconds 80}
}

function Start-PointFeedback($Point,[string]$Message) {
    Record-Feedback 'focus' $Message $Point
    if ($FeedbackEvents -and !$NoFeedback -and !$AsyncFeedback) { Start-Sleep -Milliseconds 220 }
}

function Complete-Feedback([string]$Message) {
    Record-Feedback 'pressed' $Message $null
    if ($standalone) {
        Start-Sleep -Milliseconds 330
        Record-Feedback 'success' $Message $null
    }
}

trap {
    if ($standalone) { Record-Feedback 'failure' '操作中断' $null }
    break
}

if ($Action -eq 'window-state') {
    @{ windowId = $WindowId; processId = $ProcessId; visible = [FrankBotWindows]::IsWindowVisible($handle);
       foreground = [FrankBotInput]::GetForegroundWindow() -eq $handle } | ConvertTo-Json -Compress
    return
}

if ($Action -eq 'tray-select') {
    if (!$MenuId -or !$MenuItem) { throw 'Supply the menu ID and exact label returned by tray-menu.' }
    $menu = Read-TrayMenu $MenuId
    $items = @($menu.items | Where-Object Label -ceq $MenuItem)
    if ($items.Count -ne 1) { throw 'Expected one menu item with that label.' }
    $bounds = $items[0].Bounds
    $point = New-Point ([int](($bounds.Left + $bounds.Right) / 2)) ([int](($bounds.Top + $bounds.Bottom) / 2))
    # Popup menu windows can be owned by the app without being its root window.
    $hit = [FrankBotInput]::WindowFromPoint($point)
    if ($hit -ne [IntPtr]$MenuId) { throw 'The native popup is covered or has closed.' }
    [FrankBotInput]::Move($point.X, $point.Y)
    Start-PointFeedback $point "选择托盘菜单「$MenuItem」"
    [FrankBotInput]::Click($false, 1)
    Complete-Feedback '托盘菜单点击已发送'
    @{ selected = $MenuItem; windowId = $WindowId; processId = $ProcessId } | ConvertTo-Json -Compress
    return
}

if ($Action -in 'tray-open','tray-menu') {
    if (!$TrayName -or (!$PSBoundParameters.ContainsKey('TrayIconId') -and $TrayIconGuid -eq [Guid]::Empty)) {
        throw 'Supply the observed tray name and its registered icon ID or GUID.'
    }
    $rect = [FrankBotInput]::TrayIcon($handle, $TrayIconId, $TrayIconGuid)
    $automation = [Windows.Automation.AutomationElement]
    $shellClass = $automation::ClassNameProperty
    $overflowCondition = [Windows.Automation.PropertyCondition]::new($shellClass, 'TopLevelWindowForOverflowXamlIsland')
    $shellBounds = New-Point $rect.Left $rect.Top
    $shellHit = [FrankBotInput]::WindowFromPoint($shellBounds)
    $shellWindow = [FrankBotInput]::GetAncestor($shellHit, 2)
    if ($shellWindow -ne [IntPtr]::Zero) {
        $shell = $automation::FromHandle($shellWindow)
        $chevrons = @($shell.FindAll($scope::Descendants, [Windows.Automation.PropertyCondition]::new($shellClass, 'SystemTray.NormalButton')) |
            Where-Object {
                $_.Current.Name -match '隐藏的图标|hidden icons' -and $_.Current.BoundingRectangle.Left -eq $rect.Left -and
                $_.Current.BoundingRectangle.Top -eq $rect.Top
            })
        if ($chevrons.Count -eq 1) {
            $chevrons[0].GetCurrentPattern([Windows.Automation.InvokePattern]::Pattern).Invoke()
            Start-Sleep -Milliseconds 300
            $rect = [FrankBotInput]::TrayIcon($handle, $TrayIconId, $TrayIconGuid)
        }
    }
    $point = New-Point ([int](($rect.Left + $rect.Right) / 2)) ([int](($rect.Top + $rect.Bottom) / 2))
    $roots = @($root.FindAll($scope::Children, $overflowCondition)) + @(
        $root.FindAll($scope::Children, [Windows.Automation.PropertyCondition]::new($shellClass, 'Shell_TrayWnd'))) + @(
        $root.FindAll($scope::Children, [Windows.Automation.PropertyCondition]::new($shellClass, 'Shell_SecondaryTrayWnd')))
    $nameCondition = [Windows.Automation.PropertyCondition]::new($automation::NameProperty, $TrayName)
    $matchingIcons = @(foreach ($container in $roots) {
        if ($container.Current.IsOffscreen) { continue }
        foreach ($icon in $container.FindAll($scope::Descendants, $nameCondition)) {
            $bounds = $icon.Current.BoundingRectangle
            if (!$icon.Current.IsOffscreen -and $bounds.Left -eq $rect.Left -and $bounds.Top -eq $rect.Top) {
                [pscustomobject]@{ HostWindow = $container.Current.NativeWindowHandle }
            }
        }
    })
    if ($matchingIcons.Count -ne 1) { throw 'Could not uniquely match the registered icon to the Windows tray.' }
    Assert-Hit $point ([IntPtr]$matchingIcons[0].HostWindow)
    [FrankBotInput]::Move($point.X, $point.Y)
    Start-PointFeedback $point '正在操作系统托盘图标'
    [FrankBotInput]::Click($Action -eq 'tray-menu', 1)
    Complete-Feedback '托盘图标点击已发送'
    if ($Action -eq 'tray-menu') {
        Start-Sleep -Milliseconds 250
        $menu = Read-TrayMenu 0
        @{ menuId = $menu.id; items = @($menu.items | ForEach-Object Label); windowId = $WindowId; processId = $ProcessId } |
            ConvertTo-Json -Compress
    } else {
        @{ opened = $TrayName; windowId = $WindowId; processId = $ProcessId } | ConvertTo-Json -Compress
    }
    return
}

if (![FrankBotWindows]::IsWindowVisible($handle)) { throw 'The bound window is hidden. Restore it from the tray.' }

if ($Action -in 'focus','invoke','toggle','click','hover','scroll','drag','type','key' -or ($Action -eq 'observe' -and !$ControlsOnly)) {
    $focusTimer = [Diagnostics.Stopwatch]::StartNew()
    $alreadyForeground = [FrankBotInput]::GetForegroundWindow() -eq $handle -and ![FrankBotWindows]::IsIconic($handle)
    $focused = [FrankBotInput]::EnsureForeground($handle, 190)
    $focusTimer.Stop()
    $focusResult = @{ phase='foreground'; action=$Action; windowId=$WindowId; alreadyForeground=$alreadyForeground;
        verified=$focused; durationMs=$focusTimer.Elapsed.TotalMilliseconds; overBudget=($focusTimer.Elapsed.TotalMilliseconds -gt 200) }
    if ($FeedbackEvents) {
        [IO.File]::AppendAllText($FeedbackEvents, ($focusResult | ConvertTo-Json -Compress) + [Environment]::NewLine)
    }
    if (!$focused) { throw "Foreground could not be verified within budget (elapsed=$($focusTimer.Elapsed.TotalMilliseconds) ms). Bind the active owned dialog explicitly if present." }
    if ($Action -eq 'focus') { $focusResult | ConvertTo-Json -Compress; return }
}

if ($Action -in 'click','hover','scroll','drag','type','key') {
    if ($Action -ne 'key') {
        $point = Get-WindowPoint $X $Y -Editable:($Action -eq 'type')
        Assert-Hit $point $handle
        [FrankBotInput]::Move($point.X, $point.Y)
        $labels=@{ click='正在点击'; hover='正在悬停'; scroll='正在滚动'; drag='正在拖动'; type='正在输入文字' }
        Start-PointFeedback $point $labels[$Action]
    }
    switch ($Action) {
        'click' { [FrankBotInput]::Click($MouseButton -eq 'right', $ClickCount) }
        'hover' {
            Start-Sleep -Milliseconds 150
            Complete-Feedback '已读取鼠标光标'
            @{ cursor = [FrankBotInput]::Cursor(); screenX = $point.X; screenY = $point.Y; windowId = $WindowId } |
                ConvertTo-Json -Compress
            return
        }
        'scroll' {
            if (!$WheelDelta) { throw 'Supply a nonzero wheel delta.' }
            [FrankBotInput]::Scroll($WheelDelta)
        }
        'drag' {
            $end = Get-WindowPoint $ToX $ToY
            Assert-Hit $end $handle
            [FrankBotInput]::Drag($point.X, $point.Y, $end.X, $end.Y)
        }
        'type' {
            if (($TextFile -and $PSBoundParameters.ContainsKey('Text')) -or (!$TextFile -and !$PSBoundParameters.ContainsKey('Text'))) {
                throw 'Supply Text or TextFile.'
            }
            $value = if ($TextFile) { Get-Content -LiteralPath $TextFile -Raw -Encoding utf8 } else { $Text }
            [FrankBotInput]::Click($false, 1)
            Start-Sleep -Milliseconds 100
            if ([FrankBotInput]::GetForegroundWindow() -ne $handle) { throw 'The target did not receive keyboard focus.' }
            if ($ReplaceText) {
                [FrankBotInput]::Keys([uint16[]]@(17, 65))
                if (!$value) { [FrankBotInput]::Keys([uint16[]]@(46)) }
            }
            [FrankBotInput]::Type([string]$value)
        }
        'key' {
            if (!$Keys) { throw 'Supply a key chord such as Ctrl+A.' }
            if ([FrankBotInput]::GetForegroundWindow() -ne $handle) { throw 'Observe or focus the target before sending keys.' }
            $names = @{ Ctrl = 'ControlKey'; Control = 'ControlKey'; Alt = 'Menu'; Shift = 'ShiftKey'; Win = 'LWin' }
            $codes = foreach ($key in $Keys.Split('+')) {
                $name = $key.Trim()
                if ($names.ContainsKey($name)) { $name = $names[$name] }
                if ($name -match '^[0-9]$') { $name = 'D' + $name }
                $code = [Enum]::Parse([System.Windows.Forms.Keys], $name, $true)
                if ([int]$code -lt 1 -or [int]$code -gt 254) { throw "Invalid virtual key '$name'." }
                [uint16]$code
            }
            Record-Feedback 'decide' '正在发送按键' $null
            [FrankBotInput]::Keys([uint16[]]$codes)
        }
    }
    Complete-Feedback '操作已发送'
    @{ action = $Action; windowId = $WindowId; processId = $ProcessId } | ConvertTo-Json -Compress
    return
}

if ($Action -in 'invoke','toggle') {
    $matched = Find-Control
    $name = $matched.Current.Name
    $pattern = $null
    $patternId = if ($Action -eq 'toggle') { [Windows.Automation.TogglePattern]::Pattern } else { [Windows.Automation.InvokePattern]::Pattern }
    if (!$matched.TryGetCurrentPattern($patternId, [ref]$pattern)) { throw "Control does not support $Action." }
    if ($FeedbackEvents -and !$NoFeedback) {
        $control = $matched.Current
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
            if (!$AsyncFeedback) { Start-Sleep -Milliseconds 250 }
        }
    }
    if ($Action -eq 'toggle') { $pattern.Toggle() } else { $pattern.Invoke() }

    Complete-Feedback "已操作「$name」"
    @{ action = $Action; invoked = $(if ($ControlId) { $ControlId } else { $name }); windowId = $WindowId } | ConvertTo-Json -Compress
    return
}

if ($ControlsOnly) {
    if ($Action -ne 'observe' -or $Observation -or $Screenshot) { throw 'ControlsOnly supports observe without screenshot paths.' }
    $rect = Get-Rect
    $capture = 'none'
    $imageWidth = 0
    $imageHeight = 0
} else {
if (-not $Screenshot) { throw 'Provide a screenshot output path.' }
if ([FrankBotWindows]::IsIconic($handle)) {
    [void][FrankBotWindows]::ShowWindowAsync($handle, 9)
}
$rect = New-Object FrankBotWindows+Rect
if (-not [FrankBotWindows]::GetWindowRect($handle, [ref]$rect)) { throw 'Cannot read window bounds.' }
$bitmap = [Drawing.Bitmap]::new(($rect.Right - $rect.Left), ($rect.Bottom - $rect.Top))
try {
    $graphics = [Drawing.Graphics]::FromImage($bitmap)
    try {
        $awareness = [FrankBotWindows]::GetAwarenessFromDpiAwarenessContext([FrankBotWindows]::GetWindowDpiAwarenessContext($handle))
        if ($awareness -ne 2) {
            if ([FrankBotInput]::GetForegroundWindow() -ne $handle) { throw 'The scaled window must be foreground for an accurate screenshot.' }
            $graphics.CopyFromScreen($rect.Left, $rect.Top, 0, 0, $bitmap.Size)
            $capture = 'screen'
        } else {
            $dc = $graphics.GetHdc()
            try { $captured = [FrankBotWindows]::PrintWindow($handle, $dc, 2) }
            finally { $graphics.ReleaseHdc($dc) }
            if (-not $captured) { throw 'Window capture failed.' }
            $capture = 'window'
        }
    } finally { $graphics.Dispose() }
    $scale = [Math]::Min(1.0, 1500.0 / [Math]::Max($bitmap.Width, $bitmap.Height))
    $scaled = [Drawing.Bitmap]::new($bitmap, [int]($bitmap.Width * $scale), [int]($bitmap.Height * $scale))
    $imageWidth = $scaled.Width
    $imageHeight = $scaled.Height
    try { $scaled.Save($Screenshot, [Drawing.Imaging.ImageFormat]::Png) }
    finally { $scaled.Dispose() }
} finally { $bitmap.Dispose() }

}

$controls = foreach ($element in $target.FindAll($scope::Descendants, $any)) {
    $control = $element.Current
    if ($control.IsOffscreen -or -not $control.Name) { continue }
    $invoke = $null
    $toggle = $null
    $editable = $null
    $hasToggle = $element.TryGetCurrentPattern([Windows.Automation.TogglePattern]::Pattern, [ref]$toggle)
    $hasValue = $element.TryGetCurrentPattern([Windows.Automation.ValuePattern]::Pattern, [ref]$editable)
    $enabled = $control.IsEnabled
    $b = $control.BoundingRectangle
    [pscustomobject]@{
        id = $control.AutomationId
        name = $control.Name
        controlType = $control.ControlType.ProgrammaticName
        enabled = $enabled
        invokable = [bool]($enabled -and $element.TryGetCurrentPattern([Windows.Automation.InvokePattern]::Pattern, [ref]$invoke))
        toggleState = $(if ($hasToggle) { $toggle.Current.ToggleState.ToString() } else { $null })
        value = $(if ($hasValue -and !$control.IsPassword) { $editable.Current.Value } else { $null })
        bounds = $(if (!$b.IsEmpty) { @{ left = $b.Left - $rect.Left; top = $b.Top - $rect.Top; width = $b.Width; height = $b.Height } })
    }
}
$result = @{ windowId = $WindowId; processId = $ProcessId; title = $target.Current.Name;
   screenshot = $Screenshot; capture = $capture; dpi = [FrankBotWindows]::GetDpiForWindow($handle); imageWidth = $imageWidth; imageHeight = $imageHeight;
   bounds = @{ left = $rect.Left; top = $rect.Top; width = $rect.Right - $rect.Left; height = $rect.Bottom - $rect.Top };
   controls = @($controls) } | ConvertTo-Json -Depth 6 -Compress
if ($Observation) { [IO.File]::WriteAllText($Observation, $result, [Text.UTF8Encoding]::new($false)) }
$result
