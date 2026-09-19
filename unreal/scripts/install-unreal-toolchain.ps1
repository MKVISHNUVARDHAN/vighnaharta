# Run this file from an Administrator PowerShell window.
$ErrorActionPreference = 'Stop'

$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = [Security.Principal.WindowsPrincipal]::new($identity)
if (!$principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    $quotedScript = '"' + $PSCommandPath + '"'
    Start-Process -FilePath 'powershell.exe' -Verb RunAs -ArgumentList @(
        '-NoExit',
        '-ExecutionPolicy', 'Bypass',
        '-File', $quotedScript
    )
    Write-Host 'Administrator installer opened. Accept the Windows Yes prompt and follow the new PowerShell window.' -ForegroundColor Yellow
    exit 0
}

$vswhere = 'C:\Program Files (x86)\Microsoft Visual Studio\Installer\vswhere.exe'
$vsInstaller = 'C:\Program Files (x86)\Microsoft Visual Studio\Installer\setup.exe'
$installPath = if (Test-Path $vswhere) { (& $vswhere -latest -products * -property installationPath).Trim() } else { '' }

if ($installPath -and (Test-Path $vsInstaller)) {
    & $vsInstaller modify --installPath $installPath --quiet --norestart `
        --add Microsoft.VisualStudio.Workload.NativeDesktop `
        --add Microsoft.VisualStudio.Component.VC.Tools.x86.x64 `
        --add Microsoft.VisualStudio.Component.Windows11SDK.22621 `
        --add Microsoft.Net.Component.4.8.SDK `
        --add Microsoft.Net.Component.4.8.TargetingPack
    if ($LASTEXITCODE -ne 0) { throw "Visual Studio component update failed with code $LASTEXITCODE." }
} else {
    winget install --id Microsoft.VisualStudio.2022.BuildTools --source winget `
        --accept-package-agreements --accept-source-agreements --silent `
        --override '--wait --quiet --norestart --add Microsoft.VisualStudio.Workload.NativeDesktop --add Microsoft.VisualStudio.Component.VC.Tools.x86.x64 --add Microsoft.VisualStudio.Component.Windows11SDK.22621 --add Microsoft.Net.Component.4.8.SDK --add Microsoft.Net.Component.4.8.TargetingPack'
    if ($LASTEXITCODE -ne 0) { throw "Visual Studio Build Tools installation failed with code $LASTEXITCODE." }
}

$sdkInclude = 'C:\Program Files (x86)\Windows Kits\10\Include\10.0.22621.0'
if (!(Test-Path -LiteralPath $sdkInclude)) { throw 'The expected Windows SDK 10.0.22621 was not found after installation.' }
$netFxSdk = Get-ChildItem 'C:\Program Files (x86)\Windows Kits\NETFXSDK' -Directory -ErrorAction SilentlyContinue | Select-Object -First 1
if (!$netFxSdk) { throw 'The .NET Framework SDK was not found after installation.' }

Write-Host 'Unreal C++ toolchain installed. Return to Codex and say: toolchain installed.' -ForegroundColor Green
