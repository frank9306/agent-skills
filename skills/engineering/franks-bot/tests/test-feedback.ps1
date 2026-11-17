param([Parameter(Mandatory)][string]$Output)
$ErrorActionPreference = 'Stop'
Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class FeedbackTestMonitor {
    [DllImport("user32.dll")]
    public static extern IntPtr SetThreadDpiAwarenessContext(IntPtr context);
    [DllImport("user32.dll")]
    public static extern IntPtr MonitorFromWindow(IntPtr window, uint flags);
    [DllImport("shcore.dll")]
    public static extern int GetDpiForMonitor(IntPtr monitor, int kind, out uint x, out uint y);
}
"@
[void][FeedbackTestMonitor]::SetThreadDpiAwarenessContext([IntPtr](-4))
Add-Type -AssemblyName System.Windows.Forms, System.Drawing
$script = Join-Path $PSScriptRoot '../scripts/feedback.ps1'
$failures = @()
$report = @()
foreach ($screen in [Windows.Forms.Screen]::AllScreens) {
    $area = $screen.WorkingArea
    $dir = (New-Item -ItemType Directory -Path (Join-Path $Output ('screen-' + $report.Count))).FullName
    $events = Join-Path $dir 'events.jsonl'
    $utf8 = [Text.UTF8Encoding]::new($false)
    [IO.File]::WriteAllLines($events, @('{"phase":"verify","message":"STATUS TEXT CHECK"}'), $utf8)
    $form = New-Object Windows.Forms.Form
    $form.Text = 'franks-bot display fixture'
    $form.StartPosition = 'Manual'
    $form.Location = [Drawing.Point]::new($area.Left + 30, $area.Top + 90)
    $process = $null
    try {
        $form.Show()
        $monitor = [FeedbackTestMonitor]::MonitorFromWindow($form.Handle, 2)
        $dpiX = [uint32]96; $dpiY = [uint32]96
        [void][FeedbackTestMonitor]::GetDpiForMonitor($monitor, 0, [ref]$dpiX, [ref]$dpiY)
        $process = Start-Process -FilePath powershell.exe -WindowStyle Hidden -PassThru -ArgumentList @(
            '-NoProfile', '-STA', '-File', ('"' + (Resolve-Path $script).Path + '"'),
            '-Events', ('"' + $events + '"'), '-WindowId', "$($form.Handle.ToInt64())",
            '-OwnerId', "$PID", '-EvidenceDirectory', ('"' + $dir + '"'))
        $meta = Join-Path $dir 'status-verify.png.json'
        $tracking = Join-Path $dir 'tracking.jsonl'
        $timer = [Diagnostics.Stopwatch]::StartNew()
        while ((!(Test-Path -LiteralPath $meta) -or !(Test-Path -LiteralPath $tracking)) -and !$process.HasExited -and $timer.Elapsed.TotalSeconds -lt 10) {
            [Windows.Forms.Application]::DoEvents()
            Start-Sleep -Milliseconds 100
        }
        if (!(Test-Path -LiteralPath $meta)) { throw 'Status bar rendered no verification evidence' }
        $rect = Get-Content -Raw -LiteralPath $meta | ConvertFrom-Json
        $image = [Drawing.Bitmap]::new((Join-Path $dir 'status-verify.png'))
        try {
            $ink = 0
            for ($y = [int]($image.Height * .25); $y -lt $image.Height * .78; $y++) {
                for ($x = [int]($image.Width * .50); $x -lt $image.Width * .74; $x++) {
                    $p = $image.GetPixel($x,$y)
                    if ($p.A -gt 190 -and $p.R -gt 165 -and $p.G -gt 175 -and $p.B -gt 185) { $ink++ }
                }
            }
            $row = [int]($image.Height * .93)
            $inset = 0
            while ($inset -lt $image.Width -and $image.GetPixel($inset,$row).A -lt 128) { $inset++ }
            $sameScreen = $rect.x -ge $area.Left -and $rect.x + $rect.width -le $area.Right -and
                $rect.y -ge $area.Top -and $rect.y + $rect.height -le $area.Bottom
            $round = $inset -lt $image.Height * .42
            $label = $ink -ge 20
            $report += [pscustomobject]@{ screen=$screen.DeviceName; resolution="$($screen.Bounds.Width)x$($screen.Bounds.Height)";
                dpi=$dpiX; width=$image.Width; height=$image.Height; capInset=$inset; labelPixels=$ink;
                round=$round; label=$label; sameScreen=$sameScreen }
            if (!$round -or !$label -or !$sameScreen) { $failures += $screen.DeviceName }
        } finally { $image.Dispose() }
        $before = (Get-Content -LiteralPath $tracking -Tail 1 | ConvertFrom-Json).ms
        $form.WindowState = [Windows.Forms.FormWindowState]::Minimized
        [Windows.Forms.Application]::DoEvents()
        Start-Sleep -Milliseconds 750
        $sample = Get-Content -LiteralPath $tracking -Tail 1 | ConvertFrom-Json
        $report[-1] | Add-Member -NotePropertyName minimizedVisible -NotePropertyValue (
            $sample.ms -gt $before + 400 -and $sample.statusVisible -and $sample.pointerVisible)
        if (!$report[-1].minimizedVisible) { $failures += "$($screen.DeviceName) minimized" }
    } finally {
        if ($process -and !$process.HasExited) {
            [IO.File]::AppendAllText($events, '{"phase":"success","message":"Done"}' + [Environment]::NewLine, $utf8)
            if (!$process.WaitForExit(5000)) { $process.Kill(); $process.WaitForExit() }
        }
        $form.Dispose()
    }
}
$report | ConvertTo-Json
if ($failures.Count) { throw "Status bar rendering failed on $($failures -join ', ')" }
