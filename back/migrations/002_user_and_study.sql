-- 002_user_and_study — 사용자와 학습 세션. 1단계에서 쓰는 네 테이블.
-- 설계 근거는 docs/schema.md §2·§3 에 있다.
--
-- tbl_user 는 원래 3단계(구글 로그인) 표였는데 1단계로 앞당겼다(2026-08-31 결정).
-- 사이드바가 학습 세션 목록이라 1단계부터 세션을 저장해야 하고, 세션은 user_id 를 요구한다.

create table tbl_user (
    id               bigint      generated always as identity primary key,
    google_sub       text        not null unique,   -- 구글의 불변 식별자. 이메일은 바뀔 수 있어 식별자가 아니다
    name             text        not null,          -- 사이드바가 보여주는 유일한 개인정보다
    created_datetime timestamptz not null default now()
);

create table tbl_study_session (
    id               bigint      generated always as identity primary key,
    user_id          bigint      not null references tbl_user(id),
    exam_id          bigint      not null references tbl_exam(id),
    title            text,                    -- 짓는 방식 미정(docs/product.md)
    started_datetime timestamptz not null default now(),
    ended_datetime   timestamptz,             -- null 이면 열림. 채워져 있으면 서버가 대화 입력을 거부한다
    summary          text                     -- 마무리 요약 + 꿀팁
);

-- 지난 세션을 열면 그때 대화가 그대로 있어야 하므로 문제 말풍선도 저장한다.
-- 두 check 가 message_type 과 채워지는 컬럼을 짝지어 강제한다.
create table tbl_message (
    id               bigint      generated always as identity primary key,
    session_id       bigint      not null references tbl_study_session(id) on delete cascade,
    message_type     text        not null check (message_type in ('text', 'question')),
    talker           text        not null check (talker in ('user', 'assistant')),
    content          text,                     -- message_type='question' 이면 null
    question_id      bigint      references tbl_question(id),
    created_datetime timestamptz not null default now(),
    check ((message_type = 'question') = (question_id is not null)),
    check ((message_type = 'text')     = (content     is not null))
);

-- 학습 모드에서 푼 기록. 튜터의 오답 이력 전용이고 대시보드가 조인하지 않는다
-- (docs/analytics.md §1 — 집계 대상은 모의고사 회차뿐이다).
-- unique 가 "한 문제에 답은 한 번뿐" 을 강제한다(docs/product.md §2 ③).
create table tbl_session_answer (
    id                bigint      generated always as identity primary key,
    session_id        bigint      not null references tbl_study_session(id) on delete cascade,
    question_id       bigint      not null references tbl_question(id),
    picked_markers    text[]      not null,
    correct           boolean     not null,
    answered_datetime timestamptz not null default now(),
    unique (session_id, question_id)
);

-- 3단계까지 이 앱의 유일한 사용자다. 로그인이 붙기 전에는 서버가 google_sub='imsi' 로 찾아 쓴다.
-- 합성 값이다 — 실제 구글 계정이 아니다.
insert into tbl_user (google_sub, name) values
    ('imsi', '김민중');
