param([int]$HttpPort = 8080, [int]$StreamerPort = 8888, [switch]$HighQuality)
$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$game = Join-Path $projectRoot 'build\Windows\PathOfLight\Binaries\Win64\PathOfLight.exe'
$server = Join-Path $projectRoot 'streaming-infrastructure\SignallingWebServer\dist\index.js'
if (!(Test-Path -LiteralPath $game)) { throw 'Packaged game missing. Run build-local.ps1 successfully first.' }
if (!(Test-Path -LiteralPath $server)) { throw 'Signalling server missing. Run setup-streaming.ps1 first.' }
$nodeExe = (Get-Command node -ErrorAction Stop).Source
$reports = Join-Path $projectRoot 'reports'
New-Item -ItemType Directory -Force -Path $reports | Out-Null
# A single private local session. Do not publish this without admission control.
$signal = Start-Process -FilePath $nodeExe -WorkingDirectory (Split-Path (Split-Path $server)) -ArgumentList @(('"' + $server + '"'), '--serve', '--no_config', "--player_port=$HttpPort", "--streamer_port=$StreamerPort", '--max_players=1') -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $reports 'signalling-live.txt') -RedirectStandardError (Join-Path $reports 'signalling-error.txt')
$runtime = $null
try {
    $ready = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        if ($signal.HasExited) { throw "Signalling server exited: $($signal.ExitCode). See reports/signalling-error.txt." }
        try {
            $response = Invoke-WebRequest "http://127.0.0.1:$HttpPort" -UseBasicParsing -TimeoutSec 1
            if ($response.StatusCode -eq 200) { $ready = $true; break }
        } catch { Start-Sleep -Milliseconds 250 }
    }
    if (!$ready) { throw 'Local player page did not become ready.' }
    $quality = if ($HighQuality) { 'sg.ShadowQuality 2,sg.PostProcessQuality 2,r.ScreenPercentage 100,t.MaxFPS 60' } else { 'sg.ShadowQuality 0,sg.PostProcessQuality 0,sg.EffectsQuality 0,sg.FoliageQuality 0,r.ScreenPercentage 65,t.MaxFPS 30' }
    $runtime = Start-Process -FilePath $game -ArgumentList @('-RenderOffscreen', '-AudioMixer', '-ForceRes', '-ResX=1280', '-ResY=720', '-Unattended', "-PixelStreamingURL=ws://127.0.0.1:$StreamerPort", ('-ExecCmds="' + $quality + '"')) -WindowStyle Hidden -PassThru
    Write-Host "Local browser: http://localhost:$HttpPort"
    Write-Host 'One test player only. Stop with Ctrl+C. No public contest URL is configured.'
    while (!$runtime.HasExited -and !$signal.HasExited) { Start-Sleep -Seconds 1 }
    if ($signal.HasExited) { throw "Signalling server exited: $($signal.ExitCode)" }
} finally {
    if ($runtime -and !$runtime.HasExited) { Stop-Process -Id $runtime.Id }
    if (!$signal.HasExited) { Stop-Process -Id $signal.Id }
}
