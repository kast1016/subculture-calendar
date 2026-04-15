-- Supabase events 테이블 스키마 제안
-- 실시간 동기화, 크롤러 자동 업데이트, 사용자 작성 이벤트를 모두 지원합니다.

create table if not exists events (
  id text primary key,
  external_id text unique,
  title text not null,
  start_date date not null,
  end_date date not null,
  location text,
  category text,
  url text,
  notes text,
  source text,
  created_by uuid,
  updated_at timestamp with time zone default now()
);

create unique index if not exists events_external_id_idx on events (external_id);
create index if not exists events_start_date_idx on events (start_date);
create index if not exists events_category_idx on events (category);
