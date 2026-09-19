param(
    [switch]$Fullscreen,
    [int]$ResX = 1280,
    [int]$ResY = 720
)

$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$gameExe = Join-Path $projectRoot 'build\Windows\PathOfLight\Binaries\Win64\PathOfLight.exe'

if (!(Test-Path -LiteralPath $gameExe)) {
    throw "Packaged game executable not found at: $gameExe"
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   VIGHNAHARTA: PATH OF LIGHT (SACRED MAGIC ARCADE RUNNER)" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Mode:      Packaged Standalone Game (DX11, Laptop Optimized)" -ForegroundColor White
Write-Host "Map:       TailLab (Festive Procession)" -ForegroundColor White
Write-Host "Mission:   BLAST ALL ROADBLOCKS BEFORE THE RATH CATCHES YOU (0m = CAUGHT!)" -ForegroundColor Yellow
Write-Host "Resolution: ${ResX}x${ResY} Windowed (Laptop Optimized, Drop Blob Shadows)" -ForegroundColor White
Write-Host ""
Write-Host "=== CONTROLS ===" -ForegroundColor Green
Write-Host "  [ENTER]       - START GAME / RESTART" -ForegroundColor Yellow
Write-Host "  [A] / [D]     - STEER MOOSHAK BETWEEN 3 LANES" -ForegroundColor White
Write-Host "  [SPACE]       - HIGH JUMP (Blob shadow shows ground landing point)" -ForegroundColor White
Write-Host "  [1] [2] [3] [4] - SELECT DIVINE ASTRA ON THE FLY (or [Q]/[E] CYCLE)" -ForegroundColor Cyan
Write-Host "  [AUTO-CAST]   - ON BY DEFAULT! Press [T] to toggle auto-casting" -ForegroundColor Green
Write-Host "  [F / LMB / SHIFT] - MANUAL CAST / EXTRA MAGIC VOLLEY" -ForegroundColor Magenta
Write-Host "  [ESC / P]     - PAUSE" -ForegroundColor White
Write-Host ""
Write-Host "=== DIVINE ASTRAS (GOD WEAPONS) ===" -ForegroundColor Cyan
Write-Host "  [1] INDRA'S VAJRA        - High-velocity piercing divine lightning" -ForegroundColor Yellow
Write-Host "  [2] SHIVA'S TRISHUL      - 3-Prong holy fire spread across lanes" -ForegroundColor Red
Write-Host "  [3] SUDARSHANA CHAKRA    - Spinning solar disc of celestial destruction" -ForegroundColor Cyan
Write-Host "  [4] BRAHMASTRA           - Celestial obliteration shockwave" -ForegroundColor Magenta
Write-Host ""
Write-Host "=== DEMONIC ASURA HAZARDS ===" -ForegroundColor Red
Write-Host "  * Asura Minions      - 1 HP horned demons blocking lanes" -ForegroundColor White
Write-Host "  * Hellfire Fiends    - Explosive red demons (triggers chain reaction detonations!)" -ForegroundColor Yellow
Write-Host "  * Rakshasa Brutes    - 3 HP charging behemoths rushing toward the runner" -ForegroundColor Red
Write-Host "  * Mahishasura Gates  - 6 HP towering demonic fortress gates across the street" -ForegroundColor Magenta
Write-Host ""
Write-Host "=== CHARIOT PROXIMITY & 0m CATCH RULE ===" -ForegroundColor Yellow
Write-Host "  * Rath follows behind Mooshak (starts at 32m & accelerates dynamically)." -ForegroundColor White
Write-Host "  * Miss an Asura    -> Rath surges forward (-10m penalty)!" -ForegroundColor Red
Write-Host "  * Rath reaches 0m  -> OVERTAKEN & CAUGHT! Run restarts." -ForegroundColor Red
Write-Host "  * Banish Asura     -> Rath repelled (+1.2m per kill)." -ForegroundColor Green
Write-Host "  * Sacred Bells     -> Push Rath back (+15m) & restore sacred bells!" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

$windowMode = if ($Fullscreen) { "" } else { "-windowed" }
$cmdLine = "`"$gameExe`" $windowMode -ResX=$ResX -ResY=$ResY"

Write-Host "Launching game window..." -ForegroundColor Gray
$res = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = $cmdLine }

if ($res.ReturnValue -ne 0) {
    Write-Error "Failed to start process. Return value: $($res.ReturnValue)"
} else {
    Write-Host "Game is now running! Process ID: $($res.ProcessId)" -ForegroundColor Green
    Write-Host "Window opened on your screen. Have fun playing!" -ForegroundColor Yellow
}
