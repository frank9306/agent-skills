param(
    [string]$OutputDirectory = (Join-Path (Split-Path -Parent $PSScriptRoot) 'bin')
)

$ErrorActionPreference = 'Stop'
$destination = [IO.Path]::GetFullPath($OutputDirectory)
Push-Location $PSScriptRoot
try {
    powershell.exe -NoProfile -File build-icons.ps1
    if ($LASTEXITCODE) { throw 'Icon resource build failed.' }
    npm.cmd --prefix ui ci --no-audit --no-fund
    if ($LASTEXITCODE) { throw 'UI dependency installation failed.' }
    npm.cmd --prefix ui run build
    if ($LASTEXITCODE) { throw 'UI build failed.' }
    [IO.Directory]::CreateDirectory($destination) | Out-Null
    foreach ($tool in @(@('source','desktop-capture.exe'), @('player','desktop-player.exe'))) {
        $command = './cmd/' + $tool[0]
        go build -trimpath -o (Join-Path $destination $tool[1]) $command
        if ($LASTEXITCODE) { throw "Go build failed for $command." }
    }
} finally {
    Pop-Location
}
