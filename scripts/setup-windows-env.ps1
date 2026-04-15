# Windows 환경에서 Android 빌드에 필요한 환경 변수를 설정합니다.
# 실제 경로를 사용자가 설치한 위치에 맞게 바꾸세요.

$javaHome = 'C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot'
$androidSdkRoot = "$env:USERPROFILE\AppData\Local\Android\Sdk"

$studioCandidates = @(
    'C:\Program Files\Android\Android Studio\bin\studio64.exe',
    'C:\Program Files\Android\Android Studio\bin\studio.exe',
    'C:\Program Files\Google\Android Studio\bin\studio64.exe',
    'C:\Program Files\Google\Android Studio\bin\studio.exe',
    "$env:USERPROFILE\AppData\Local\Programs\Android\Android Studio\bin\studio64.exe",
    "$env:USERPROFILE\AppData\Local\Programs\Android\Android Studio\bin\studio.exe",
    "$env:LOCALAPPDATA\Programs\Android\Android Studio\bin\studio64.exe",
    "$env:LOCALAPPDATA\Programs\Android\Android Studio\bin\studio.exe"
)

Write-Host "Setting JAVA_HOME=$javaHome"
Write-Host "Setting ANDROID_SDK_ROOT=$androidSdkRoot"

setx JAVA_HOME "$javaHome" | Out-Null
setx ANDROID_SDK_ROOT "$androidSdkRoot" | Out-Null
setx ANDROID_HOME "$androidSdkRoot" | Out-Null
setx PATH "$($env:PATH);$javaHome\bin;$androidSdkRoot\platform-tools;$androidSdkRoot\emulator" | Out-Null

$studioPath = $null
foreach ($candidate in $studioCandidates) {
    if (Test-Path $candidate) {
        $studioPath = $candidate
        break
    }
}

if ($studioPath) {
    Write-Host "Found Android Studio at: $studioPath"
    setx CAPACITOR_ANDROID_STUDIO_PATH "$studioPath" | Out-Null
    Write-Host "CAPACITOR_ANDROID_STUDIO_PATH 환경 변수를 설정했습니다."
} else {
    Write-Host "Android Studio 실행 파일을 찾지 못했습니다."
    Write-Host "Android Studio가 설치되어 있다면 아래 중 하나의 경로를 확인하고 스크립트에서 수정하세요:"
    foreach ($candidate in $studioCandidates) { Write-Host "  $candidate" }
    Write-Host "또는 Android Studio 설치 경로를 수동으로 CAPACITOR_ANDROID_STUDIO_PATH 환경 변수로 설정하세요."
}

Write-Host "환경 변수가 설정되었습니다. 새 PowerShell 창을 열고 다음을 확인하세요:"
Write-Host "  java -version"
Write-Host "  echo `$env:JAVA_HOME"
Write-Host "  echo `$env:ANDROID_SDK_ROOT"
if ($studioPath) { Write-Host "  echo `$env:CAPACITOR_ANDROID_STUDIO_PATH" }
