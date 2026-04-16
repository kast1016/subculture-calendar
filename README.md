# 서브컬처 행사 캘린더

`서브컬처 행사 캘린더`는 순수 JavaScript 기반 캘린더 앱입니다. 로컬 일정과 공식 이벤트를 함께 관리할 수 있으며, 웹, Android 모바일, Electron 데스크톱 버전을 지원합니다.

## 빠른 시작
```bash
npm install
npm start
```

## 프로젝트 구조
- `index.html` — 웹 앱 진입 페이지
- `download.html` — 기기 감지 다운로드 랜딩 페이지
- `download/index.html` — GitHub Pages `download/` 디렉터리 리디렉션
- `404.html` — 잘못된 URL 접근 시 다운로드 페이지로 리디렉션
- `styles.css` — 스타일 정의
- `app.js` — 캘린더 및 일정 관리 로직
- `events.json` — 기본 공식 일정 데이터
- `supabaseClient.js` — Supabase 연결 설정 (기본 비활성화)
- `capacitor.config.ts` — Capacitor 모바일 설정
- `android/` — Android 네이티브 프로젝트
- `ios/` — iOS 네이티브 프로젝트
- `scripts/` — 빌드 및 환경 설정 스크립트
- `tools/` — 로컬 도구 및 Portable Git

## 실행 방법
### 웹 앱
```bash
npm install
npm run build:web
```
웹 빌드 결과는 `www/`에 생성됩니다.

### Electron 데스크톱 앱
```bash
npm install
npm start
```

### Android 빌드
```bash
npm install
npm run build:web
npm run cap:sync
cd android
gradlew.bat assembleRelease
```

Android 릴리스 빌드 후 생성되는 파일:
- `android/app/build/outputs/apk/debug/app-debug.apk`
- `android/app/build/outputs/apk/release/app-release-unsigned.apk`
- `android/app/build/outputs/apk/release/app-release-signed.apk` (수동 서명 시)

### Android 릴리스 서명
`android/app/build.gradle`는 프로젝트 루트의 `android/release.keystore` 파일이 존재하면 자동으로 서명하도록 구성되어 있습니다.

`android/release.keystore`는 보안상 커밋되지 않으므로 안전하게 보관하세요.

## GitHub Pages 배포
```bash
npm run deploy:gh-pages
```

Windows에서 이 명령은 로컬 `tools/PortableGit/cmd`를 사용합니다.

## GitHub 릴리스
현재 릴리스 자산 이름:
- `subculture-calendar-setup.exe`
- `app-release-signed.apk`

다운로드 페이지 기본 링크:
- Windows 설치 파일: `https://github.com/kast1016/subculture-calendar/releases/latest/download/subculture-calendar-setup.exe`
- Android APK: `https://github.com/kast1016/subculture-calendar/releases/latest/download/app-release-signed.apk`
- 릴리스 페이지: `https://github.com/kast1016/subculture-calendar/releases/latest`

Android 모바일에서는 위 APK 링크를 탭하여 직접 다운로드하고 설치하면 앱을 실행할 수 있습니다. Windows에서는 EXE 설치 프로그램을 내려받아 설치하세요.

## Supabase
`supabaseClient.js`는 현재 기본으로 `supabase = null` 상태입니다. 실제 Supabase 연결을 사용하려면 파일을 수정해 주세요.

## 유용한 스크립트
- `npm run build:web` — 웹 앱 빌드
- `npm run cap:sync` — Capacitor 동기화
- `npm run cap:open:android` — Android 스튜디오 실행
- `npm run android:build-debug` — Android 디버그 빌드
- `npm run android:build-release` — Android 릴리스 빌드
- `npm run deploy:gh-pages` — GitHub Pages 배포
- `npm run setup:windows-env` — Windows 환경 설정

## 참고
- `android/release.keystore`는 `.gitignore`에 포함되어 있습니다.
- `index.html`은 데스크톱 및 웹 앱의 캘린더 진입 페이지입니다.
- `404.html`은 잘못된 URL 접근 시 다운로드 페이지로 리디렉션됩니다.
- `download.html`은 접속 기기를 자동 감지하여 가장 적합한 설치 링크를 표시합니다.
- `file://` 환경에서는 브라우저 보안 제한으로 `fetch`가 실패할 수 있습니다.
- `http://` 또는 `https://` 환경에서 실행하세요.
- 모바일 앱은 `www/` 빌드 결과를 사용합니다.
