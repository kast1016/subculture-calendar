$ErrorActionPreference = 'Stop'

Write-Host "1) Loading .env values if present..."
$envFile = Join-Path $PSScriptRoot '..\.env'
if (Test-Path $envFile) {
  & (Join-Path $PSScriptRoot 'load-env.ps1')
  Write-Host ".env 파일에서 환경 변수를 로드했습니다."
} else {
  Write-Host ".env 파일이 없습니다. 기존 환경 변수를 사용합니다."
}

Write-Host "2) Installing Supabase CLI locally..."
& (Join-Path $PSScriptRoot 'install-supabase-cli.ps1')

Write-Host "3) Applying Supabase schema if environment variables are set..."
if ($env:SUPABASE_URL -and $env:SUPABASE_SERVICE_KEY) {
  & (Join-Path $PSScriptRoot 'apply-supabase-schema.ps1')
} else {
  Write-Host "SUPABASE_URL 또는 SUPABASE_SERVICE_KEY가 설정되어 있지 않습니다. 스크립트를 실행하려면 두 변수를 모두 설정하세요."
}

Write-Host "4) Registering GitHub secrets if GITHUB_TOKEN is set..."
if ($env:GITHUB_TOKEN -and $env:SUPABASE_URL -and $env:SUPABASE_SERVICE_KEY) {
  & .\scripts\set-github-secrets.ps1
} else {
  Write-Host "GITHUB_TOKEN 또는 Supabase 환경 변수가 설정되어 있지 않습니다. GitHub 시크릿 등록을 건너뜁니다."
}

Write-Host "자동화 스크립트 실행이 완료되었습니다. 필요한 경우 환경 변수를 설정한 뒤 다시 실행하세요."
