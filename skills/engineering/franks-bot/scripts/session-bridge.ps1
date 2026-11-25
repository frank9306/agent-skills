param([string]$DesktopName)

$ErrorActionPreference = 'Stop'
[Console]::InputEncoding = [Text.UTF8Encoding]::new($false)
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
if ($DesktopName) {
    Add-Type -Path (Join-Path $PSScriptRoot 'desktop-hidden.cs')
    [FrankBotHidden]::VerifyDesktop($DesktopName)
}
while ($null -ne ($line = [Console]::ReadLine())) {
    try {
        $params = @{}
        $request = $line | ConvertFrom-Json
        foreach ($entry in $request.params.PSObject.Properties) {
            $params[$entry.Name] = $entry.Value
        }
        if ($DesktopName -and $params.Action -in 'hidden-launch','hidden-list','hidden-close','hidden-exited') {
            $result = switch ($params.Action) {
                'hidden-launch' {
                    $program = Get-Item -LiteralPath $params.Executable
                    if ($params.SingleInstance -and @(Get-Process -Name $program.BaseName -ErrorAction SilentlyContinue).Count) {
                        @{ skipped = $true; reason = 'A matching application is already running.' }
                    } else {
                        @{ desktopName = $DesktopName; processId = [FrankBotHidden]::Launch($program.FullName, $params.CommandLine, $program.DirectoryName) }
                    }
                }
                'hidden-list' { @{ windows = [FrankBotHidden]::List() } }
                'hidden-close' { [FrankBotHidden]::RequestClose(); @{ requested = $true } }
                'hidden-exited' { @{ exited = [FrankBotHidden]::Exited() } }
            }
            $output = $result | ConvertTo-Json -Compress -Depth 5
        } elseif ($DesktopName) {
            $params.Remove('HiddenDesktop')
            $params.Remove('NoFeedback')
            $params.Remove('FeedbackEvents')
            $output = &(Join-Path $PSScriptRoot 'desktop.ps1') @params -HiddenDesktop -NoFeedback
        } else {
            $output = &(Join-Path $PSScriptRoot 'desktop.ps1') @params -AsyncFeedback
        }
        $reply = @{ok=$true; json=($output | Out-String).Trim()}
    } catch {
        $cause = $_.Exception.GetBaseException()
        $retryable = $params.Action -eq 'observe' -and (
            $cause -is [Runtime.InteropServices.COMException] -or
            $cause -is [Windows.Automation.ElementNotAvailableException])
        $reply = @{ok=$false; error=$_.Exception.Message; retryable=$retryable}
    }
    [Console]::WriteLine(($reply | ConvertTo-Json -Compress -Depth 12))
}
