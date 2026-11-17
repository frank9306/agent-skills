$ErrorActionPreference = 'Stop'
[Console]::InputEncoding = [Text.UTF8Encoding]::new($false)
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
while ($null -ne ($line = [Console]::ReadLine())) {
    try {
        $request = $line | ConvertFrom-Json
        $params = @{}
        foreach ($entry in $request.params.PSObject.Properties) {
            $params[$entry.Name] = $entry.Value
        }
        $output = &(Join-Path $PSScriptRoot 'desktop.ps1') @params -AsyncFeedback
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
