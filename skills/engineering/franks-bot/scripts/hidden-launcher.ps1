$ErrorActionPreference = 'Stop'
Add-Type -Path (Join-Path $PSScriptRoot 'desktop-hidden.cs')
$program = Join-Path $PSHOME 'powershell.exe'
exit [FrankBotHidden]::Bootstrap($program, (Join-Path $PSScriptRoot 'session-bridge.ps1'))
