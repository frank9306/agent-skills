$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
$scripts = Join-Path $PSScriptRoot '../scripts'
Add-Type -Path (Join-Path $scripts 'desktop-input.cs')
Add-Type 'using System; using System.Runtime.InteropServices; public static class TestWindow { [DllImport("user32.dll")] public static extern bool EnableWindow(IntPtr window, bool enabled); }'
$target = New-Object Windows.Forms.Form
$other = New-Object Windows.Forms.Form
try {
    $target.Text = 'franks-bot foreground fixture'
    $target.Show()
    $other.Text = 'franks-bot owned dialog fixture'
    $other.Show($target)
    $windows = & (Join-Path $scripts 'desktop.ps1') -Action list | ConvertFrom-Json
    if (!($windows | Where-Object { $_.windowId -eq $other.Handle.ToInt64() -and $_.processId -eq $PID })) {
        throw 'Owned dialog missing from window inventory'
    }
    [void][FrankBotInput]::Activate($other.Handle)
    $timer = [Diagnostics.Stopwatch]::StartNew()
    $ok = [FrankBotInput]::EnsureForeground($target.Handle, 190)
    $timer.Stop()
    if (!$ok -or [FrankBotInput]::GetForegroundWindow() -ne $target.Handle) { throw 'Covered target was not activated' }
    $cold = $timer.Elapsed.TotalMilliseconds
    [void][TestWindow]::EnableWindow($target.Handle, $false)
    if ([FrankBotInput]::EnsureForeground($target.Handle, 190)) { throw 'Disabled modal owner must not accept input' }
    [void][TestWindow]::EnableWindow($target.Handle, $true)
    $samples = @(1..30 | ForEach-Object {
        if ($_ % 2 -eq 0) { [void][FrankBotInput]::Activate($other.Handle) }
        $timer.Restart()
        if (![FrankBotInput]::EnsureForeground($target.Handle, 190)) { throw 'Foreground not verified' }
        $timer.Stop()
        $timer.Elapsed.TotalMilliseconds
    })
    @{ firstMs=$cold; samplesMs=$samples; maxMs=($samples | Measure-Object -Maximum).Maximum } | ConvertTo-Json -Compress
} finally { $other.Dispose(); $target.Dispose() }
