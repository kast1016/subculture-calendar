# 서브컬처 행사 캘린더 앱

`서브컬처 행사 캘린더`는 로컬 저장소와 정적 JSON 데이터를 활용하는 Vanilla JS 캘린더 앱입니다. 개인 일정과 공식 일정을 함께 관리하며, 월별 달력에서 행사 추가/수정/삭제가 가능합니다.

## 빠른 시작
```bash
npm install
npm start
```

## 프로젝트 구조
- `index.html` — 앱 UI
- `styles.css` — 스타일 정의
- `app.js` — 캘린더 및 일정 관리 로직
- `events.json` — 기본 행사 데이터
- `supabase-schema.sql` — Supabase DB 스키마
- `supabaseClient.js` — Supabase 클라이언트 설정
- `capacitor.config.ts` — Capacitor 모바일 설정
- `android/` — Android 네이티브 프로젝트
- `ios/` — iOS 네이티브 프로젝트
- `scripts/automation/` — 자동화 스크립트
- `tools/` — 로컬 Supabase CLI 등 도구

## 실행 방법
### 데스크톱
```bash
npm install
npm start
```

### Android 빌드
```bash
npm install
npm run setup:windows-env
npm run build:web
npm run cap:add:android
npm run cap:sync
npm run cap:open:android
```

디버그 APK:
- `android/app/build/outputs/apk/debug/app-debug.apk`

### iOS 빌드
Windows 환경에서는 직접 Xcode 빌드 대신 GitHub Actions를 사용합니다.

```bash
npm install
npm run build:web
npm run cap:add:ios
npm run cap:sync
```

## 자동화 및 배포
### 자동화 스크립트
자동화 스크립트는 `scripts/automation/`에 모여 있습니다.

- `scripts/automation/auto-setup.ps1` — `.env` 로드, Supabase CLI 설치, 스키마 적용, GitHub 시크릿 등록
- `scripts/automation/apply-supabase-schema.js` / `.ps1` — Supabase 스키마 적용
- `scripts/automation/set-github-secrets.js` / `.ps1` — GitHub Actions 시크릿 등록
- `scripts/automation/load-env.ps1` — `.env` 파일 로드
- `scripts/automation/install-supabase-cli.js` / `.ps1` — Supabase CLI 설치
- `scripts/automation/crawl-events.mjs` — 이벤트 크롤링 자동화

### `.env` 예시
```text
SUPABASE_URL=https://semjfmsbjwfcdeiigxzf.supabase.co
SUPABASE_ANON_KEY=sb_publishable_XXXXXXXXXXXXXXXXXXXXXXXXXXXX
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_DB_URL=postgresql://postgres:YOUR_DB_PASSWORD@db.semjfmsbjwfcdeiigxzf.supabase.co:5432/postgres
SUPABASE_PROJECT_REF=semjfmsbjwfcdeiigxzf
GITHUB_TOKEN=ghp_yourgithubtokenhere
GITHUB_REPOSITORY=kast1016/subculture-calendar
```

### GitHub Secrets 등록
```powershell
$env:GITHUB_TOKEN='<your-github-token>'
$env:SUPABASE_URL='https://semjfmsbjwfcdeiigxzf.supabase.co'
$env:SUPABASE_SERVICE_KEY='<your-service-role-key>'
$env:GITHUB_REPOSITORY='kast1016/subculture-calendar'
.\scriptsutomation\set-github-secrets.ps1
```

### Supabase 스키마 적용
```powershell
$env:SUPABASE_URL='https://semjfmsbjwfcdeiigxzf.supabase.co'
$env:SUPABASE_SERVICE_KEY='<your-service-role-key>'
.\scriptsutomationpply-supabase-schema.ps1
```

원격 DB 직접 연결:
```text
SUPABASE_DB_URL=postgresql://postgres:YOUR_DB_PASSWORD@db.semjfmsbjwfcdeiigxzf.supabase.co:5432/postgres
# 또는
SUPABASE_DB_PASSWORD=YOUR_DB_PASSWORD
SUPABASE_PROJECT_REF=semjfmsbjwfcdeiigxzf
```

> 원격 DB 호스트는 `db.<project_ref>.supabase.co` 형식이어야 합니다.

### GitHub Actions
- `apply_supabase_schema` 워크플로: `.github/workflows/apply_supabase_schema.yml`
- 기존 이벤트 동기화: `.github/workflows/daily_update.yml`

## Supabase 정보
- `supabaseClient.js` URL: `https://semjfmsbjwfcdeiigxzf.supabase.co`
- `supabaseClient.js` Anon Key: `sb_publishable_qZ0ppArlwacxAJWWqb0NOw_tOyYCV3b`

## 이벤트 데이터
기본 공식 일정은 `events.json`에서 불러옵니다.

예시:
```json
[
  { "date": "2026-05-02", "title": "제177회 서울 코믹월드", "location": "킨텍스", "category": "코믹월드", "url": "https://comicw.co.kr/" },
  { "date": "2026-05-14", "title": "2026 플레이엑스포", "location": "킨텍스", "category": "게임전시회", "url": "https://www.playx4.or.kr/" }
]
```

## 주요 기능
- 로컬 저장소에 개인 일정 저장
- `events.json` 기반 공식 일정 로드
- 달력 UI와 이벤트 배지
- 일정 추가/수정/삭제

## 참고
- `file://` 환경에서는 `fetch`가 실패할 수 있습니다.
- `http://` 또는 `https://` 환경에서 실행하세요.
- Electron 앱은 로컬 `events.json`을 직접 읽습니다.
- 모바일 앱은 `www/` 빌드 결과를 사용합니다.
