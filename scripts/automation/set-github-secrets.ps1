$ErrorActionPreference = 'Stop'

if (-not $env:GITHUB_TOKEN) {
  throw "환경 변수 GITHUB_TOKEN을 설정해야 합니다."
}
if (-not $env:SUPABASE_URL -or -not $env:SUPABASE_SERVICE_KEY) {
  throw "환경 변수 SUPABASE_URL 및 SUPABASE_SERVICE_KEY를 모두 설정해야 합니다."
}

$repo = $env:GITHUB_REPOSITORY
if (-not $repo) {
  $repo = 'kast1016/subculture-calendar'
  Write-Host "GITHUB_REPOSITORY가 설정되지 않았습니다. 기본 리포지토 '$repo'를 사용합니다."
}

Write-Host "Setting GitHub repository secrets for repo: $repo"
node "$PSScriptRoot\set-github-secrets.js" $env:GITHUB_TOKEN $env:SUPABASE_URL $env:SUPABASE_SERVICE_KEY $repo
