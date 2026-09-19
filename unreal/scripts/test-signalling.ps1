$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$serverRoot = Join-Path $projectRoot 'streaming-infrastructure\SignallingWebServer'
$serverFile = Join-Path $serverRoot 'dist\index.js'
if (!(Test-Path $serverFile)) { throw 'Build the streaming infrastructure first.' }
$nodeExe = (Get-Command node).Source
$stdout = Join-Path $projectRoot 'reports\signalling-stdout.txt'
$stderr = Join-Path $projectRoot 'reports\signalling-stderr.txt'
$serverProcess = Start-Process -FilePath $nodeExe -WorkingDirectory $serverRoot -ArgumentList @(('"' + $serverFile + '"'), '--serve', '--no_config', '--player_port=18080', '--streamer_port=18888', '--sfu_port=18889', '--max_players=1', '--log_config') -RedirectStandardOutput $stdout -RedirectStandardError $stderr -WindowStyle Hidden -PassThru
try {
    $response = $null
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        if ($serverProcess.HasExited) { throw 'Signalling process exited. Inspect reports/signalling-stderr.txt.' }
        try { $response = Invoke-WebRequest 'http://127.0.0.1:18080/' -TimeoutSec 1; break }
        catch { Start-Sleep -Milliseconds 300 }
    }
    if (!$response -or $response.StatusCode -ne 200 -or $response.Content -notmatch '<html') { throw 'Player page did not load.' }
    'PASS: local signalling server serves its player page over HTTP.'
    'NOT TESTED: Unreal video/audio, input, encoder, touch, latency or a second subscriber.'
} finally {
    if (!$serverProcess.HasExited) { Stop-Process -Id $serverProcess.Id }
}
