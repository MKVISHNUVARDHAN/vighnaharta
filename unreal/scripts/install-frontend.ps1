$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$destination = Join-Path $root 'streaming-infrastructure\SignallingWebServer\www'
if (!(Test-Path -LiteralPath (Join-Path $destination 'player.js'))) { throw 'Build the Epic streaming frontend first with setup-streaming.ps1.' }
foreach ($file in @('player.html', 'vighnaharta.css', 'vighnaharta.js')) {
    Copy-Item -LiteralPath (Join-Path $root "frontend\$file") -Destination (Join-Path $destination $file) -Force
}
Write-Host 'Vighnaharta browser controls installed.'
