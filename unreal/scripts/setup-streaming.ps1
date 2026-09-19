$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$infra = Join-Path $projectRoot 'streaming-infrastructure'
if (!(Test-Path -LiteralPath $infra)) {
    & git clone --depth 1 --branch UE5.8 https://github.com/EpicGamesExt/PixelStreamingInfrastructure.git $infra
    if ($LASTEXITCODE -ne 0) { throw 'Could not obtain the UE5.8 streaming infrastructure.' }
}
$nodeVersion = (& node --version).TrimStart('v')
if ([version]$nodeVersion -lt [version]'22.15.0') { throw 'Use Node 22.15+ or Node 24 LTS.' }
Push-Location $infra
try {
    # Only the direct single-player signalling/frontend workspaces are needed.
    # Do not install the SFU, JS streamer or browser-test workspaces for this gate.
    & npm install --no-audit --no-fund --workspace=Common --workspace=Signalling --workspace=SignallingWebServer --workspace=Frontend/library --workspace=Frontend/ui-library --workspace=Frontend/implementations/typescript
    if ($LASTEXITCODE -ne 0) { throw 'Streaming dependency installation failed.' }
    & npm run build:all:cjs
    if ($LASTEXITCODE -ne 0) { throw 'Streaming infrastructure build failed.' }
} finally { Pop-Location }
foreach ($output in @('SignallingWebServer\dist\index.js', 'SignallingWebServer\www\player.html')) {
    if (!(Test-Path -LiteralPath (Join-Path $infra $output))) { throw "Streaming setup did not generate $output" }
}
& (Join-Path $PSScriptRoot 'install-frontend.ps1')
