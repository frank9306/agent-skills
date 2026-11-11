param([Parameter(Mandatory)][string]$Executable,[string]$Output)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class LightbandProbe {
  [StructLayout(LayoutKind.Sequential)] public struct Rect { public int L,T,R,B; }
  [DllImport("user32",CharSet=CharSet.Unicode)] public static extern IntPtr FindWindow(string c,string t);
  [DllImport("user32")] public static extern bool GetWindowRect(IntPtr w,out Rect r);
  [DllImport("user32")] public static extern bool IsWindowVisible(IntPtr w);
  [DllImport("user32")] public static extern IntPtr SetThreadDpiAwarenessContext(IntPtr c);
  [DllImport("user32",EntryPoint="SystemParametersInfoW")] public static extern bool Get(uint a,uint b,out int c,uint d);
  [DllImport("user32",EntryPoint="SystemParametersInfoW")] public static extern bool Set(uint a,uint b,IntPtr c,uint d);
}
"@
function Sample($window,[string]$save) {
  $r=[LightbandProbe+Rect]::new()
  if (![LightbandProbe]::GetWindowRect($window,[ref]$r)) { throw 'Capsule bounds unavailable' }
  $b=[Drawing.Bitmap]::new($r.R-$r.L,$r.B-$r.T)
  $g=[Drawing.Graphics]::FromImage($b)
  try {
    $g.CopyFromScreen($r.L,$r.T,0,0,$b.Size)
    if ($save) { $b.Save($save) }
    $pixels=[Collections.Generic.List[string]]::new()
    for($x=35;$x -lt $b.Width-35;$x++){
      foreach($y in @(0,1,2,($b.Height-3),($b.Height-2),($b.Height-1))){
        $p=$b.GetPixel($x,$y)
        if($p.R -gt 120 -and $p.B -gt 210 -and $p.B -gt $p.R+10){$pixels.Add("$x,$y")}
      }
    }
    return ($pixels -join '|')
  } finally { $g.Dispose();$b.Dispose() }
}
function Push($renderer,[string]$action) {
  $renderer.StandardInput.WriteLine((@{task='Inventory check';action=$action}|ConvertTo-Json -Compress))
  $renderer.StandardInput.Flush()
}
function Renderer {
  $start=[Diagnostics.ProcessStartInfo]::new($Executable)
  $start.UseShellExecute=$false
  $start.RedirectStandardInput=$true
  [Diagnostics.Process]::Start($start)
}
function Wait-Capsule {
  for($i=0;$i -lt 100;$i++){
    $window=[LightbandProbe]::FindWindow('UiAutomationTaskCapsule','UI Automation')
    if($window -ne [IntPtr]::Zero -and [LightbandProbe]::IsWindowVisible($window)){return $window}
    Start-Sleep -Milliseconds 30
  }
  throw 'Capsule did not appear'
}
$original=0
if(![LightbandProbe]::Get(0x1042,0,[ref]$original,0)){throw 'Could not read animation preference'}
$context=[LightbandProbe]::SetThreadDpiAwarenessContext([IntPtr](-4))
try{
  foreach($enabled in @(1,0)){
    if(![LightbandProbe]::Set(0x1043,0,[IntPtr]$enabled,0)){throw 'Could not set animation preference'}
    $renderer=Renderer
    try{
      Push $renderer 'wait'
      $window=Wait-Capsule
      Start-Sleep -Milliseconds 440
      $first=Sample $window $(if($enabled){$Output}else{''})
      Push $renderer 'wait'
      Start-Sleep -Milliseconds 200
      $second=Sample $window ''
      if(!$first -or !$second){throw "Lightband did not render on both sampled frames ($enabled)"}
      if(($first -ne $second) -ne [bool]$enabled){throw "Lightband disagreed with the Windows animation preference ($enabled)"}
      if($enabled){
        Start-Sleep -Milliseconds 1900
        if(Sample $window ''){throw 'Lightband remained visible after heartbeat expired'}
      }
      Push $renderer 'pass'
      Start-Sleep -Milliseconds 150
      if(Sample $window ''){throw 'Lightband remained visible in the terminal state'}
    } finally {
      $renderer.StandardInput.Close()
      if(!$renderer.WaitForExit(3000)){$renderer.Kill()}
      $renderer.Dispose()
    }
  }
  'PASS: active motion, reduced-motion static highlight, disconnect and terminal static border'
} finally {
  [LightbandProbe]::Set(0x1043,0,[IntPtr]$original,0)|Out-Null
  [LightbandProbe]::SetThreadDpiAwarenessContext($context)|Out-Null
}
