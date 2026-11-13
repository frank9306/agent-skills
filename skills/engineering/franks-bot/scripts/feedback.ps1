param(
    [Parameter(Mandatory)][string]$Events,
    [long]$WindowId,
    [int]$OwnerId,
    [long]$StartedTick = [Diagnostics.Stopwatch]::GetTimestamp(),
    [string]$EvidenceDirectory
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName PresentationFramework, PresentationCore, WindowsBase, System.Drawing
Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class FrankFeedback {
    [StructLayout(LayoutKind.Sequential)]
    public struct Rect { public int Left, Top, Right, Bottom; }
    [StructLayout(LayoutKind.Sequential)]
    public struct Point { public int X, Y; }
    [DllImport("user32.dll")] public static extern bool GetCursorPos(out Point point);
    [DllImport("user32.dll")] public static extern IntPtr MonitorFromPoint(Point point, uint flags);
    [DllImport("user32.dll")] public static extern bool SetProcessDpiAwarenessContext(IntPtr context);
    [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hwnd, out Rect rect);
    [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr hwnd);
    [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hwnd);
    [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hwnd, out int pid);
    [DllImport("user32.dll")] public static extern IntPtr MonitorFromWindow(IntPtr hwnd, uint flags);
    [DllImport("user32.dll")] public static extern uint GetDpiForWindow(IntPtr hwnd);
    [DllImport("shcore.dll")] public static extern int GetDpiForMonitor(IntPtr monitor, int kind, out uint x, out uint y);
    [StructLayout(LayoutKind.Sequential)]
    public struct MonitorInfo { public int Size; public Rect Monitor, Work; public uint Flags; }
    [DllImport("user32.dll", CharSet=CharSet.Auto)]
    public static extern bool GetMonitorInfo(IntPtr monitor, ref MonitorInfo info);
    [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr hwnd, IntPtr after,
        int x, int y, int width, int height, uint flags);
    [DllImport("user32.dll")] public static extern int GetWindowLong(IntPtr hwnd, int index);
    [DllImport("user32.dll")] public static extern int SetWindowLong(IntPtr hwnd, int index, int value);
}
'@
[void][FrankFeedback]::SetProcessDpiAwarenessContext([IntPtr](-4))

function New-Overlay([Windows.UIElement]$content) {
    $window = [Windows.Window]::new()
    $window.WindowStyle = 'None'
    $window.ResizeMode = 'NoResize'
    $window.AllowsTransparency = $true
    $window.Background = [Windows.Media.Brushes]::Transparent
    $window.ShowInTaskbar = $false
    $window.ShowActivated = $false
    $window.Focusable = $false
    $window.Topmost = $true
    $window.Content = $content
    $window.Add_SourceInitialized({
        param($sender, $eventArgs)
        $hwnd = [Windows.Interop.WindowInteropHelper]::new($sender).Handle
        $style = [FrankFeedback]::GetWindowLong($hwnd, -20)
        [void][FrankFeedback]::SetWindowLong($hwnd, -20, ($style -bor 0x080000A0))
    })
    return $window
}

function New-Label([double]$size, [string]$color) {
    $label = [Windows.Controls.TextBlock]::new()
    $label.FontFamily = 'Segoe UI'
    $label.FontSize = $size
    $label.Foreground = $color
    $label.VerticalAlignment = 'Center'
    $label.TextTrimming = 'CharacterEllipsis'
    return $label
}

$grid = [Windows.Controls.Grid]::new()
foreach ($width in '24','104','*','54') {
    $column = [Windows.Controls.ColumnDefinition]::new()
    $column.Width = [Windows.GridLengthConverter]::new().ConvertFromString($width)
    [void]$grid.ColumnDefinitions.Add($column)
}
$dot = [Windows.Shapes.Ellipse]::new()
$dot.Width = 8
$dot.Height = 8
$dot.HorizontalAlignment = 'Center'
$dot.VerticalAlignment = 'Center'
$brand = New-Label 14 '#FFFFFF'
$brand.Text = "frank's-bot"
$brand.FontWeight = 'SemiBold'
$label = New-Label 14 '#E4EEFF'
$label.Margin = '8,0,8,0'
$elapsedLabel = New-Label 12 '#A9BED8'
$elapsedLabel.FontFamily = 'Consolas'
$elapsedLabel.HorizontalAlignment = 'Right'
$elapsedLabel.Margin = '0,0,4,0'
$items = @($dot, $brand, $label, $elapsedLabel)
for ($i = 0; $i -lt $items.Count; $i++) {
    [Windows.Controls.Grid]::SetColumn($items[$i], $i)
    [void]$grid.Children.Add($items[$i])
}
$bar = [Windows.Controls.Border]::new()
$bar.Background = '#F5142032'
$bar.BorderBrush = '#526C8D'
$bar.BorderThickness = 1
$bar.CornerRadius = 22
$bar.Padding = '8,0,12,0'
$bar.Child = $grid
$statusSurface = [Windows.Controls.Grid]::new()
[void]$statusSurface.Children.Add($bar)
$edge = [Windows.Controls.Canvas]::new()
[void]$statusSurface.Children.Add($edge)
$trail = for ($i = 0; $i -lt 9; $i++) {
    $light = [Windows.Shapes.Ellipse]::new()
    $light.Width = 4
    $light.Height = 4
    [void]$edge.Children.Add($light)
    $light
}
$edgePath = $null
$edgeWidth = 0
$edgeHeight = 0
$outline = [Windows.Controls.Border]::new()
$outline.BorderBrush = '#FFFFFF'
$outline.BorderThickness = 3
$outline.CornerRadius = 10
$statusWindow = New-Overlay $statusSurface
$focusWindow = New-Overlay $outline
$pointerOuter = [Windows.Controls.Border]::new()
$pointerOuter.BorderBrush = '#E01A2435'
$pointerOuter.BorderThickness = 1
$pointerOuter.CornerRadius = 18
$pointerInner = [Windows.Controls.Border]::new()
$pointerInner.Margin = 1
$pointerInner.BorderBrush = '#F5329DFF'
$pointerInner.BorderThickness = 2
$pointerInner.CornerRadius = 17
$pointerOuter.Child = $pointerInner
$pointerWindow = New-Overlay $pointerOuter
$app = [Windows.Application]::new()
$app.ShutdownMode = 'OnExplicitShutdown'
$target = [IntPtr]$WindowId
$timer = [Windows.Threading.DispatcherTimer]::new()
$timer.Interval = [TimeSpan]::FromMilliseconds(50)
$script:lastLine = 0
$script:clock = [Diagnostics.Stopwatch]::StartNew()
$script:lastEvent = 0
$script:phase = 'observe'
$script:finishAt = $null
$script:ringAt = $null
$script:ring = $null
$script:reducedMotion = -not [Windows.SystemParameters]::ClientAreaAnimation
$script:terminalElapsed = $null
$script:frame = 0
$script:captures = @{}
$script:labelAt = 0
$label.Text = '正在准备桌面任务'
$dot.Fill = '#65ADFF'

function Update-Edge([double]$now) {
    $width = $statusSurface.ActualWidth
    $height = $statusSurface.ActualHeight
    if ($width -lt 64 -or $height -lt 16 -or $reducedMotion -or $null -ne $terminalElapsed) {
        $edge.Visibility = 'Collapsed'
        $bar.BorderBrush = $dot.Fill
        return
    }
    $edge.Visibility = 'Visible'
    if ($edgeWidth -ne $width -or $edgeHeight -ne $height) {
        $script:edgeWidth = $width
        $script:edgeHeight = $height
        $radius = $height / 2 - 2
        $right = $width - 2
        $bottom = $height - 2
        $rightCenter = $right - $radius
        $leftCenter = 2 + $radius
        $path = [string]::Format([Globalization.CultureInfo]::InvariantCulture,
            'M {0},2 L {1},2 A {2},{2} 0 0 1 {1},{3} L {0},{3} A {2},{2} 0 0 1 {0},2',
            $leftCenter, $rightCenter, $radius, $bottom)
        $script:edgePath = [Windows.Media.PathGeometry]::CreateFromGeometry([Windows.Media.Geometry]::Parse($path))
    }
    for ($index = 0; $index -lt $trail.Count; $index++) {
        $fraction = ($now / 3 - $index * 0.005) % 1
        if ($fraction -lt 0) { $fraction += 1 }
        $point = [Windows.Point]::new(0, 0)
        $tangent = [Windows.Point]::new(0, 0)
        $edgePath.GetPointAtFractionLength($fraction, [ref]$point, [ref]$tangent)
        $light = $trail[$index]
        $light.Fill = $dot.Fill
        $light.Opacity = (1 - $index / 10) * (0.78 + 0.22 * [Math]::Cos($now * 4))
        [Windows.Controls.Canvas]::SetLeft($light, $point.X - 2)
        [Windows.Controls.Canvas]::SetTop($light, $point.Y - 2)
    }
}

function Place($window, [int]$x, [int]$y, [int]$w, [int]$h) {
    $helper = [Windows.Interop.WindowInteropHelper]::new($window)
    $hwnd = $helper.EnsureHandle()
    [void][FrankFeedback]::SetWindowPos($hwnd, [IntPtr](-1), $x, $y, $w, $h, 0x10)
    if (-not $window.IsVisible) { $window.Show() }
}

function Save-Evidence($window, [string]$name) {
    if (-not $EvidenceDirectory -or $captures.ContainsKey($name)) { return }
    $window.UpdateLayout()
    $dpi = [Windows.Media.VisualTreeHelper]::GetDpi($window)
    $width = [int][Math]::Ceiling($window.ActualWidth * $dpi.DpiScaleX)
    $height = [int][Math]::Ceiling($window.ActualHeight * $dpi.DpiScaleY)
    if ($width -lt 1 -or $height -lt 1) { return }
    $image = [Windows.Media.Imaging.RenderTargetBitmap]::new(
        $width, $height, $dpi.PixelsPerInchX, $dpi.PixelsPerInchY, [Windows.Media.PixelFormats]::Pbgra32)
    $image.Render($window)
    $encoder = [Windows.Media.Imaging.PngBitmapEncoder]::new()
    $encoder.Frames.Add([Windows.Media.Imaging.BitmapFrame]::Create($image))
    $path = Join-Path $EvidenceDirectory "$name.png"
    $stream = [IO.File]::Open($path, [IO.FileMode]::CreateNew)
    try { $encoder.Save($stream) } finally { $stream.Dispose() }
    $rect = New-Object FrankFeedback+Rect
    $hwnd = [Windows.Interop.WindowInteropHelper]::new($window).Handle
    if ([FrankFeedback]::GetWindowRect($hwnd, [ref]$rect)) {
        $metadata = @{ x = $rect.Left; y = $rect.Top; width = $width; height = $height
            styles = [FrankFeedback]::GetWindowLong($hwnd, -20); reducedMotion = $reducedMotion }
        [IO.File]::WriteAllText("$path.json", ($metadata | ConvertTo-Json -Compress))
    }
    $captures[$name] = $true
}

$timer.Add_Tick({
    try {
        $now = $clock.Elapsed.TotalSeconds
        $pidOfWindow = 0
        [void][FrankFeedback]::GetWindowThreadProcessId($target, [ref]$pidOfWindow)
        if ($pidOfWindow -ne $OwnerId -or -not [FrankFeedback]::IsWindowVisible($target)) {
            $app.Shutdown()
            return
        }
        $lines = @()
        try { $lines = @([IO.File]::ReadAllLines($Events, [Text.Encoding]::UTF8)) }
        catch [IO.IOException] {}
        while ($lastLine -lt $lines.Count) {
            try { $event = ConvertFrom-Json -InputObject $lines[$lastLine] -ErrorAction Stop }
            catch { break }
            $script:lastLine++
            $script:lastEvent = $now
            $script:phase = $event.phase
            $label.Text = [string]$event.message
            $script:labelAt = $now
            $dot.Fill = switch ($phase) {
                'success' { '#79D9AB' }
                'failure' { '#FF9A9A' }
                { $_ -in 'wait','fallback','cancel' } { '#FFD080' }
                default { '#65ADFF' }
            }
            if ($phase -eq 'focus') {
                $script:ring = $event
                $script:ringAt = $now
                $script:frame++
            } elseif ($phase -eq 'pressed' -and $ring) {
                $script:ringAt = $now
            } elseif ($phase -in 'failure','cancel','success') {
                $script:ring = $null
                $script:terminalElapsed = if ($null -ne $event.elapsedSeconds) {
                    [double]$event.elapsedSeconds
                } else {
                    ([Diagnostics.Stopwatch]::GetTimestamp() - $StartedTick) / [Diagnostics.Stopwatch]::Frequency
                }
                $script:finishAt = $now + $(if ($phase -eq 'success') { 2 } else { 4 })
            }
        }
        if (($null -ne $finishAt -and $now -ge $finishAt) -or $now - $lastEvent -gt 90) {
            $app.Shutdown()
            return
        }
        if ([FrankFeedback]::IsIconic($target)) {
            $statusWindow.Hide()
            $focusWindow.Hide()
            $pointerWindow.Hide()
            return
        }
        $monitor = [FrankFeedback]::MonitorFromWindow($target, 2)
        $info = New-Object FrankFeedback+MonitorInfo
        $info.Size = [Runtime.InteropServices.Marshal]::SizeOf($info)
        if (-not [FrankFeedback]::GetMonitorInfo($monitor, [ref]$info)) { return }
        $dpiX = [uint32]96
        $dpiY = [uint32]96
        [void][FrankFeedback]::GetDpiForMonitor($monitor, 0, [ref]$dpiX, [ref]$dpiY)
        $width = [int][Math]::Min(440 * $dpiX / 96, $info.Work.Right - $info.Work.Left - 24)
        $height = [int](44 * $dpiY / 96)
        Place $statusWindow ([int](($info.Work.Left + $info.Work.Right - $width) / 2)) ($info.Work.Top + 12) $width $height
        $seconds = [int][Math]::Floor($(if ($null -ne $terminalElapsed) { $terminalElapsed } else {
            ([Diagnostics.Stopwatch]::GetTimestamp() - $StartedTick) / [Diagnostics.Stopwatch]::Frequency
        }))
        $elapsedLabel.Text = '{0:00}:{1:00}' -f [Math]::Floor($seconds / 60), ($seconds % 60)
        $label.Opacity = if ($reducedMotion) { 1 } else { 0.8 + 0.2 * [Math]::Min(1, ($now - $labelAt) / 0.18) }
        $dot.Opacity = if (-not $reducedMotion -and $phase -in 'observe','decide') {
            0.72 + 0.28 * [Math]::Cos($now * 4)
        } else { 1 }
        Update-Edge $now
        $cursor = New-Object FrankFeedback+Point
        if ($null -eq $terminalElapsed -and [FrankFeedback]::GetCursorPos([ref]$cursor)) {
            $pointerDpi = [uint32]96
            $pointerDpiY = [uint32]96
            $pointerMonitor = [FrankFeedback]::MonitorFromPoint($cursor, 2)
            [void][FrankFeedback]::GetDpiForMonitor($pointerMonitor, 0, [ref]$pointerDpi, [ref]$pointerDpiY)
            $diameter = [int](36 * $pointerDpi / 96)
            $half = [int]($diameter / 2)
            $pointerInner.Opacity = if ($reducedMotion) { 1 } else { 0.78 + 0.22 * [Math]::Cos($now * 5) }
            Place $pointerWindow ($cursor.X - $half) ($cursor.Y - $half) $diameter $diameter
        } else { $pointerWindow.Hide() }
        if ($phase -in 'decide','verify','success','failure','fallback') { Save-Evidence $statusWindow "status-$phase" }
        if ($phase -eq 'decide') {
            Save-Evidence $pointerWindow 'pointer'
            if ($now - $lastEvent -ge 0.7) { Save-Evidence $statusWindow 'status-decide-later' }
        }

        if (-not $ring) { $focusWindow.Hide(); return }
        $age = $now - $ringAt
        $pressed = $phase -ne 'focus'
        if ($age -gt 2 -or ($pressed -and $age -gt 0.55)) {
            $script:ring = $null
            $focusWindow.Hide()
            return
        }
        $bounds = New-Object FrankFeedback+Rect
        if (-not [FrankFeedback]::GetWindowRect($target, [ref]$bounds) -or
            $ring.windowWidth -ne ($bounds.Right - $bounds.Left) -or
            $ring.windowHeight -ne ($bounds.Bottom - $bounds.Top) -or
            $ring.dpi -ne [FrankFeedback]::GetDpiForWindow($target)) {
            $script:ring = $null
            $focusWindow.Hide()
            return
        }
        $pad = if ($reducedMotion) { 4 } elseif ($pressed) { 4 + [int]($age * 18) } else { 4 + [int](4 * [Math]::Max(0, 1 - $age * 6)) }
        $outline.Opacity = if ($pressed -and -not $reducedMotion) { [Math]::Max(0, 1 - $age / 0.55) } else { 1 }
        Place $focusWindow ($bounds.Left + $ring.x - $pad) ($bounds.Top + $ring.y - $pad) ($ring.width + 2*$pad) ($ring.height + 2*$pad)
        if ($phase -eq 'focus') {
            Save-Evidence $statusWindow "step-$frame-status"
            Save-Evidence $focusWindow "step-$frame-focus"
        }
    } catch {
        [IO.File]::WriteAllText("$Events.error", $_.ToString())
        $app.Shutdown(1)
    }
})
$timer.Start()
[void]$app.Run()
