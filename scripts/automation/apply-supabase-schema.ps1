$ErrorActionPreference = 'Stop'

$exePath = Join-Path $PSScriptRoot '..\tools\supabase.exe'
$schemaFile = Join-Path $PSScriptRoot '..\supabase-schema.sql'

if (-not (Test-Path $exePath)) {
  throw "Supabase CLI not installed. 먼저 scripts\install-supabase-cli.ps1를 실행하세요."
}
if (-not $env:SUPABASE_URL -or -not $env:SUPABASE_SERVICE_KEY) {
  throw "환경 변수 SUPABASE_URL 및 SUPABASE_SERVICE_KEY를 설정해야 합니다."
}
if (-not (Test-Path $schemaFile)) {
  throw "supabase-schema.sql 파일을 찾을 수 없습니다."
}

Write-Host "Applying Supabase SQL schema via Node wrapper script..."

Push-Location (Join-Path $PSScriptRoot '..')
$nodePath = Get-Command node -ErrorAction Stop | Select-Object -ExpandProperty Source
$scriptPath = Join-Path $PSScriptRoot 'apply-supabase-schema.js'
$process = Start-Process -FilePath $nodePath -ArgumentList @($scriptPath) -NoNewWindow -Wait -PassThru -RedirectStandardOutput stdout.txt -RedirectStandardError stderr.txt
Get-Content stdout.txt
Get-Content stderr.txt
if ($process.ExitCode -ne 0) {
  throw "Supabase schema 적용 중 오류가 발생했습니다."
}
Write-Host "Supabase schema applied successfully."
