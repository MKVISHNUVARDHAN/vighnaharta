param(
    [string]$EngineRoot = 'C:\Program Files\Epic Games\UE_5.8'
)
$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$projectFile = Join-Path $projectRoot 'PathOfLight\PathOfLight.uproject'
$editor = Join-Path $EngineRoot 'Engine\Binaries\Win64\UnrealEditor-Cmd.exe'
$builder = Join-Path $EngineRoot 'Engine\Build\BatchFiles\Build.bat'
$uat = Join-Path $EngineRoot 'Engine\Build\BatchFiles\RunUAT.bat'
foreach ($file in @($projectFile, $editor, $builder, $uat)) {
    if (!(Test-Path -LiteralPath $file)) { throw "Missing required file: $file" }
}
New-Item -ItemType Directory -Force -Path (Join-Path $projectRoot 'reports') | Out-Null
& $builder PathOfLightEditor Win64 Development "-Project=$projectFile" -WaitMutex -NoHotReloadFromIDE 2>&1 |
    Tee-Object -FilePath (Join-Path $projectRoot 'reports\editor-build.txt')
if ($LASTEXITCODE -ne 0) { throw 'Editor compilation failed. See reports/editor-build.txt.' }
$mapScript = Join-Path $projectRoot 'PathOfLight\Content\Python\create_tail_lab.py'
& $editor $projectFile -run=pythonscript "-script=$mapScript" -unattended -nullrhi -nosplash -stdout -FullStdOutLogOutput 2>&1 |
    Tee-Object -FilePath (Join-Path $projectRoot 'reports\map-generation.txt')
if ($LASTEXITCODE -ne 0) { throw 'Map generation failed.' }
if (!(Test-Path (Join-Path $projectRoot 'PathOfLight\Content\Maps\TailLab.umap'))) { throw 'TailLab map was not saved.' }
& $uat BuildCookRun "-project=$projectFile" -noP4 -platform=Win64 -clientconfig=Development -build -cook -stage -pak -archive "-archivedirectory=$(Join-Path $projectRoot 'build')" -utf8output 2>&1 |
    Tee-Object -FilePath (Join-Path $projectRoot 'reports\package.txt')
if ($LASTEXITCODE -ne 0) { throw 'Windows packaging failed. See reports/package.txt.' }
Write-Host 'Windows build packaged. Next: setup-streaming.ps1, then start-local.ps1.'
