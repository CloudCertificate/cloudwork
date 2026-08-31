-- 001_init — 문제은행. 1단계에서 쓰는 다섯 테이블.
-- 설계 근거와 나머지 단계의 테이블은 docs/schema.md 에 있다.

-- 'none' 은 필기·실기로 갈리지 않는 단일 시험이다(SAA-C03).
create type certification_type as enum ('written', 'practical', 'none');

-- 자격증. 이름만 갖는다 — 문항 수·시간은 시험마다 다르므로 tbl_exam 로 내려간다
create table tbl_certification (
    id   bigint generated always as identity primary key,
    name text   not null unique
);

-- 시험. 문제가 실제로 속하는 곳이다.
create table tbl_exam (
    id                  bigint             generated always as identity primary key,
    certification_id    bigint             not null references tbl_certification(id),
    certification_type  certification_type not null default 'none',
    question_count      smallint           not null,
    time_limit_minutes  smallint           not null,
    unique (certification_id, certification_type)
);

-- 문제 유형. 도메인 4개(뿌리)와 태스크 14개(자식)를 parent_id 로 잇는다.
-- code 는 공식 가이드의 표기('1.1' = Task 1.1)이고 사람이 읽는 값이다.
-- 계층은 parent_id 가 표현한다 — code 를 잘라서 부모나 도메인을 알아내지 않는다.
create table tbl_question_category (
    id        bigint generated always as identity primary key,
    parent_id bigint references tbl_question_category(id),
    code      text   not null unique   -- 뿌리 '1'~'4' / 자식 '1.1'~'4.4'
);

-- 골라야 하는 보기 수는 컬럼으로 두지 않는다 — tbl_choice 의 correct 를 세면 나온다.
-- 컬럼으로 두면 보기와 어긋나도 DB 가 못 막는다(docs/schema.md).
create table tbl_question (
    id               bigint      generated always as identity primary key,
    exam_id          bigint      not null references tbl_exam(id),
    category_id      bigint      not null references tbl_question_category(id),
    content          text        not null,
    source_urls      text[]      not null default '{}',
    status           text        not null default 'draft'
                                 check (status in ('draft', 'approved')),
    created_datetime timestamptz not null default now(),
    -- 승인하려면 근거 url 이 있어야 한다. 덤프가 아님을 증명하는 값이다(docs/question-data.md §1)
    check (status = 'draft' or cardinality(source_urls) > 0)
);

-- marker 의 좁은 제약은 의도한 것이다(docs/question-data.md §4).
-- 공식 가이드는 더 넓지만 우리는 1정답/4보기와 2정답/5보기 두 형태만 만든다.
create table tbl_choice (
    id          bigint  generated always as identity primary key,
    question_id bigint  not null references tbl_question(id) on delete cascade,
    marker      text    not null check (marker in ('a', 'b', 'c', 'd', 'e')),
    content     text    not null,
    correct     boolean not null,
    explanation text    not null,
    unique (question_id, marker)
);

-- 지금 만드는 시험은 SAA-C03 하나다. 표 구조는 여럿을 받지만 시드는 실제로 문제를 만들 시험만 심는다.
insert into tbl_certification (name) values
    ('AWS Solutions Architect Associate');

insert into tbl_exam (certification_id, certification_type, question_count, time_limit_minutes)
select id, 'none', 65, 130
from tbl_certification where name = 'AWS Solutions Architect Associate';

-- 뿌리 4개가 id 1~4 를 받고 자식이 그 번호를 참조한다. FK 는 문장이 끝난 뒤 검사되므로 한 문장으로 된다.
-- 이 표를 채우는 것은 이 문장뿐이고 create table 직후라 시퀀스가 1부터 시작한다 — 그 가정 위에 서 있다.
insert into tbl_question_category (parent_id, code) values
    (null, '1'), (null, '2'), (null, '3'), (null, '4'),
    (1, '1.1'), (1, '1.2'), (1, '1.3'),
    (2, '2.1'), (2, '2.2'),
    (3, '3.1'), (3, '3.2'), (3, '3.3'), (3, '3.4'), (3, '3.5'),
    (4, '4.1'), (4, '4.2'), (4, '4.3'), (4, '4.4');
