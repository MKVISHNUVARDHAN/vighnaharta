param(
    [switch]$Editor,
    [string]$EngineRoot = 'C:\Program Files\Epic Games\UE_5.8'
)

$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$projectFile = Join-Path $projectRoot 'PathOfLight\PathOfLight.uproject'
$reportDir = Join-Path $projectRoot 'reports'
New-Item -ItemType Directory -Force -Path $reportDir | Out-Null
$testArguments = @('-nullrhi', '-unattended', '-nosplash', '-nosound', '-PathOfLightAudit',
    '-ExecCmds=PathOfLight.Audit', '-stdout', '-FullStdOutLogOutput')
if ($Editor) {
    $executable = Join-Path $EngineRoot 'Engine\Binaries\Win64\UnrealEditor-Cmd.exe'
    $testArguments = @($projectFile, '/Game/Maps/TailLab', '-game') + $testArguments
    $report = Join-Path $reportDir 'audit-runtime.txt'
} else {
    $executable = Join-Path $projectRoot 'build\Windows\PathOfLight\Binaries\Win64\PathOfLight.exe'
    $report = Join-Path $reportDir 'audit-packaged-runtime.txt'
}
if (!(Test-Path -LiteralPath $executable)) { throw "Missing executable: $executable" }
& $executable @testArguments 2>&1 | Tee-Object -FilePath $report
if ($LASTEXITCODE -ne 0) { throw "Gameplay audit failed. See $report" }
if (!(Select-String -LiteralPath $report -SimpleMatch 'GAMEPLAY_AUDIT COMPLETE: 0 failures' -Quiet)) {
    throw "The process exited without completing the gameplay audit. See $report"
}
Write-Host "Gameplay regression checks passed. Report: $report"
