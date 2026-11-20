$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$env:EXPO_NO_TELEMETRY = '1'
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw 'Bitte zuerst Node.js 24 LTS installieren: https://nodejs.org/'
}
& npm ci
if ($LASTEXITCODE -ne 0) { throw 'Installation fehlgeschlagen.' }
& npm run typecheck
if ($LASTEXITCODE -ne 0) { throw 'Typprüfung fehlgeschlagen.' }
& npm test
if ($LASTEXITCODE -ne 0) { throw 'Tests fehlgeschlagen.' }
& npx expo prebuild --platform android --no-install
if ($LASTEXITCODE -ne 0) { throw 'Android-Projekt konnte nicht erstellt werden.' }
Write-Host 'Projekt erstellt. In Android Studio den Unterordner android öffnen.'
Write-Host 'Project created. Open the android subfolder in Android Studio.'
