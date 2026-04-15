$ErrorActionPreference = 'Stop'

$toolsDir = Join-Path $PSScriptRoot '..\tools'
$archivePath = Join-Path $toolsDir 'supabase_windows_amd64.tar.gz'
$exePath = Join-Path $toolsDir 'supabase.exe'
$url = 'https://github.com/supabase/cli/releases/download/v2.90.0/supabase_windows_amd64.tar.gz'

if (-not (Test-Path $toolsDir)) {
  New-Item -ItemType Directory -Path $toolsDir | Out-Null
}

Write-Host "Downloading Supabase CLI from $url"
Invoke-WebRequest -Uri $url -OutFile $archivePath -UseBasicParsing
Write-Host "Extracting $archivePath"
tar -xzf $archivePath -C $toolsDir
Write-Host "Removing archive file"
Remove-Item $archivePath -Force

if (-not (Test-Path $exePath)) {
  throw "Supabase CLI executable not found at $exePath"
}

Write-Host "Supabase CLI installed at $exePath"
