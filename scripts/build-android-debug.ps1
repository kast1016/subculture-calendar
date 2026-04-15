$jdkPath = 'C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot'
if (-not (Test-Path $jdkPath)) {
  throw "JDK 경로를 찾을 수 없습니다: $jdkPath"
}

$env:JAVA_HOME = $jdkPath
$env:PATH = "$jdkPath\bin;$env:PATH"

Write-Host "JAVA_HOME=$env:JAVA_HOME"
Write-Host "java -version 결과:"
& "$jdkPath\bin\java.exe" -version

Push-Location ..
Write-Host '웹 빌드 시작...'
node .\scripts\build-web.js

Write-Host 'Capacitor Android 동기화 시작...'
npx cap sync android

Push-Location android
Write-Host 'Android Debug APK 빌드 시작...'
& .\gradlew.bat assembleDebug
Pop-Location
Pop-Location
