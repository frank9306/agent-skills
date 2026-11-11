# Run with PowerShell 7 on an interactive Windows desktop.
param([Parameter(Mandatory)][string]$Work, [switch]$RequireMixedDpi)
$ErrorActionPreference = 'Stop'
$Work=(Resolve-Path $Work).Path
if (!$env:APP_USE_HOME) { throw 'Set APP_USE_HOME to a prepared test runtime with fixture/Fixture.exe' }
$cli = Join-Path $PSScriptRoot '../scripts/app-use.mjs'
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms
if ($RequireMixedDpi -and [Windows.Forms.Screen]::AllScreens.Count -lt 2) {
  throw 'Mixed-DPI acceptance requires two active Windows displays.'
}
Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class CapsuleProbe {
  [StructLayout(LayoutKind.Sequential)] public struct Rect { public int L,T,R,B; }
  [StructLayout(LayoutKind.Sequential)] public struct Point { public int X,Y; }
  [StructLayout(LayoutKind.Sequential)] public struct Monitor { public uint Size; public Rect Bounds,Work; public uint Flags; }
  [DllImport("user32")] public static extern IntPtr SetThreadDpiAwarenessContext(IntPtr context);
  [DllImport("user32",CharSet=CharSet.Unicode)] public static extern IntPtr FindWindow(string cls, string title);
  [DllImport("user32")] public static extern bool IsWindowVisible(IntPtr window);
  [DllImport("user32")] public static extern bool GetWindowRect(IntPtr window, out Rect rect);
  [DllImport("user32")] public static extern int GetWindowLong(IntPtr window, int index);
  [DllImport("user32")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32")] public static extern IntPtr WindowFromPoint(Point p);
  [DllImport("user32")] public static extern uint GetDpiForWindow(IntPtr window);
  [DllImport("user32")] public static extern IntPtr MonitorFromWindow(IntPtr window, uint flags);
  [DllImport("user32")] public static extern bool GetMonitorInfo(IntPtr monitor, ref Monitor info);
  [DllImport("user32")] public static extern bool SetWindowPos(IntPtr window, IntPtr order, int x, int y, int width, int height, uint flags);
  [DllImport("user32")] public static extern bool ShowWindowAsync(IntPtr window, int command);
}
"@
function Assert($condition, [string]$message) { if (!$condition) { throw $message } }
function Wait-Until([scriptblock]$Condition, [string]$message, [int]$Attempts=100) {
  for ($i=0; $i -lt $Attempts; $i++) {
    $value=& $Condition
    if ($value) { return $value }
    Start-Sleep -Milliseconds 40
  }
  throw $message
}
function Capsule {
  $handle=[CapsuleProbe]::FindWindow('UiAutomationTaskCapsule', 'UI Automation')
  if ($handle -ne [IntPtr]::Zero -and [CapsuleProbe]::IsWindowVisible($handle)) { return $handle }
}
function Read-Placement($CapsuleWindow, $TargetWindow) {
  $capsule=$CapsuleWindow
  $window=$TargetWindow
  $bounds=[CapsuleProbe+Rect]::new()
  Assert ([CapsuleProbe]::GetWindowRect($capsule,[ref]$bounds)) 'No window geometry'
  $dpi=[CapsuleProbe]::GetDpiForWindow($capsule)
  $monitor=[CapsuleProbe]::MonitorFromWindow($window,2)
  Assert (([CapsuleProbe]::MonitorFromWindow($capsule,2)) -eq $monitor) 'Wrong monitor'
  $mi=[CapsuleProbe+Monitor]::new()
  $mi.Size=[Runtime.InteropServices.Marshal]::SizeOf($mi)
  Assert ([CapsuleProbe]::GetMonitorInfo($monitor,[ref]$mi)) 'No monitor work area'
  Assert (($bounds.T-$mi.Work.T) -eq [Math]::Floor((12*$dpi+48)/96)) 'Wrong work-area top spacing'
  Assert (($bounds.B-$bounds.T) -eq [Math]::Floor((44*$dpi+48)/96)) 'Wrong scaled height'
  Assert ([Math]::Abs($bounds.L+$bounds.R-$mi.Work.L-$mi.Work.R) -le 1) 'Wrong horizontal centering'
  return @{Bounds=$bounds;Dpi=$dpi}
}
$target=Start-Process -FilePath "$env:APP_USE_HOME/fixture/Fixture.exe" -PassThru
$session=$null
$run=$null
try {
  $window=Wait-Until { $target.Refresh(); if ($target.MainWindowHandle -ne [IntPtr]::Zero) { $target.MainWindowHandle } } 'Fixture did not open'
  [CapsuleProbe]::ShowWindowAsync($window, 3) | Out-Null
  $prepared=node $cli prepare --kind desktop --hwnd "$($window.ToInt64())" --pid "$($target.Id)" | ConvertFrom-Json
  Assert ($prepared.session) "Prepare failed: $($prepared.error)"
  $session=$prepared.session
  $caseFile=Join-Path $Work 'capsule-live-case.json'
  $expected=@{target=@{name='Fixture result';role='edit'};property='value';equals='Controlled:Alpha'}
  @{
    version=1;id='验证桌面自动化';session=$session;start='focus';stepTimeoutMs=14000
    states=@{
      focus=@{action=@{type='focus'};next='fill'}
      fill=@{action=@{type='fill';text='Controlled';match=@{name='Fixture input';role='edit'}};next='wait'}
      wait=@{wait=@{assertion=$expected;timeoutMs=13000;intervalMs=200};next='goal'}
      goal=@{assert=$expected;next='done'}
      done=@{finish='complete'}
    }
    cleanup=@(@{type='key';key='Escape'})
  } | ConvertTo-Json -Depth 12 | Set-Content -Encoding utf8 $caseFile
  $node=(Get-Command node).Source
  $info=[Diagnostics.ProcessStartInfo]::new($node)
  foreach($arg in @($cli,'run','--request',$caseFile,'--out',"$Work/capsule-live-evidence")) { $info.ArgumentList.Add($arg) }
  $info.UseShellExecute=$false
  $info.CreateNoWindow=$true
  $info.RedirectStandardOutput=$true
  $info.RedirectStandardError=$true
  $run=[Diagnostics.Process]::Start($info)
  $out=$run.StandardOutput.ReadToEndAsync()
  $err=$run.StandardError.ReadToEndAsync()
  $capsule=Wait-Until { Capsule } 'Capsule did not appear'
  $deadline=[DateTime]::UtcNow.AddSeconds(3.3)
  $samples=0
  $secondaryDpi=$null
  $dpiContext=[CapsuleProbe]::SetThreadDpiAwarenessContext([IntPtr](-4))
  try {
    while ([DateTime]::UtcNow -lt $deadline) {
      Assert ((Capsule) -eq $capsule) 'Capsule disappeared or restarted between actions'
      $samples++
      Start-Sleep -Milliseconds 60
    }
    $placement=Read-Placement $capsule $window
    $bounds=$placement.Bounds
    $dpi=$placement.Dpi
    Assert (([CapsuleProbe]::GetWindowLong($capsule,-20) -band 0x080800a8) -eq 0x080800a8) 'Required window styles missing'
    Assert (([CapsuleProbe]::GetForegroundWindow()) -eq $window) 'Capsule stole foreground'
    $point=[CapsuleProbe+Point]::new()
    $point.X=[int](($bounds.L+$bounds.R)/2)
    $point.Y=[int](($bounds.T+$bounds.B)/2)
    Assert (([CapsuleProbe]::WindowFromPoint($point)) -ne $capsule) 'Capsule intercepts point hit-test'
    $bitmap=[Drawing.Bitmap]::new($bounds.R-$bounds.L,$bounds.B-$bounds.T)
    $graphics=[Drawing.Graphics]::FromImage($bitmap)
    try {
      $graphics.CopyFromScreen($bounds.L,$bounds.T,0,0,$bitmap.Size)
      Assert ($bitmap.GetPixel([int](20*$dpi/96),[int](22*$dpi/96)).ToArgb() -eq [Drawing.Color]::FromArgb(250,200,112).ToArgb()) 'Waiting state was not amber'
      $bitmap.Save((Join-Path $Work 'capsule-actual.png'))
    } finally { $graphics.Dispose(); $bitmap.Dispose() }

    $screen=[Windows.Forms.Screen]::FromHandle($window)
    $secondary=[Windows.Forms.Screen]::AllScreens | Where-Object DeviceName -ne $screen.DeviceName | Select-Object -First 1
    if ($secondary) {
      $beforeMonitor=[CapsuleProbe]::MonitorFromWindow($window,2)
      [CapsuleProbe]::ShowWindowAsync($window,9) | Out-Null
      Start-Sleep -Milliseconds 150
      $area=$secondary.WorkingArea
      Assert ([CapsuleProbe]::SetWindowPos($window,[IntPtr]::Zero,$area.X+20,$area.Y+80,[Math]::Min(640,$area.Width-40),[Math]::Min(460,$area.Height-100),0x14)) 'Fixture could not move to another display'
      Wait-Until {
        $targetMonitor=[CapsuleProbe]::MonitorFromWindow($window,2)
        ($targetMonitor -ne $beforeMonitor) -and ([CapsuleProbe]::MonitorFromWindow($capsule,2) -eq $targetMonitor)
      } 'Capsule did not follow the fixture across displays' -Attempts 30 | Out-Null
      Assert ((Capsule) -eq $capsule) 'Capsule restarted after crossing displays'
      $secondaryDpi=(Read-Placement $capsule $window).Dpi
      Assert ($secondaryDpi -eq [CapsuleProbe]::GetDpiForWindow($window)) 'Capsule and fixture use different DPI on the new screen'
    }
    if ($RequireMixedDpi) {
      Assert ($null -ne $secondaryDpi -and $secondaryDpi -ne $dpi) 'Mixed-DPI acceptance requires a successful move between displays at different DPI.'
    }
  } finally { [CapsuleProbe]::SetThreadDpiAwarenessContext($dpiContext) | Out-Null }
  $other=(node $cli prepare --kind desktop --hwnd "$($window.ToInt64())" --pid "$($target.Id)" | ConvertFrom-Json).session
  try {
    $o=node $cli observe --session $other | ConvertFrom-Json
    $button=@($o.nodes | Where-Object { $_.name -eq 'Apply fixture' -and $_.role -eq 'button' })
    Assert ($button.Length -eq 1) 'Fixture trigger not unique'
    $trigger=Join-Path $Work 'capsule-fixture-trigger.json'
    @{ session=$other; observation=$o.id; action=@{type='invoke';target=$button[0].id} } | ConvertTo-Json -Depth 5 | Set-Content -Encoding utf8 $trigger
    $acted=node $cli act --request $trigger | ConvertFrom-Json
    Assert ($acted.actionExecuted) "Fixture trigger failed: $($acted.error)"
  } finally { node $cli stop --session $other | Out-Null }
  Assert ($run.WaitForExit(13000)) 'Run did not finish'
  $json=$out.GetAwaiter().GetResult() | ConvertFrom-Json
  $stderr=$err.GetAwaiter().GetResult()
  Assert ($stderr.Length -eq 0) "Unexpected capsule diagnostics: $stderr"
  Assert ($json.status -eq 'pass') "Runner verdict: $($json.status) $($json.error)"
  Assert (!(Capsule)) 'Capsule remained visible after completion'
  @{status='pass';dpi=$dpi;secondaryDpi=$secondaryDpi;samples=$samples;runDir=$json.runDir;windowWidth=$bounds.R-$bounds.L;windowHeight=$bounds.B-$bounds.T} | ConvertTo-Json
} finally {
  if ($run -and !$run.HasExited) { $run.Kill(); $run.WaitForExit() }
  if ($run -and $run.ExitCode -ne 0) { Write-Host $err.GetAwaiter().GetResult() }
  if ($session) { node $cli stop --session $session | Out-Null }
  if (!$target.HasExited) { $target.Kill() }
}
