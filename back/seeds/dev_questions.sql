-- 개발용 표본 문제 4개. 마이그레이션이 아니다 — 이름 순 적용 대상(migrations/)에 넣지 않는다.
--
-- 목적은 문제은행이 아니라 왕복 확인이다. 프런트 하드코딩(front/src/api/quiz.js)에 있던 것을
-- 그대로 옮겼으므로 화면이 옛 데이터로 그리던 것과 서버가 준 것을 눈으로 대조할 수 있다.
-- 기출이 아니라 AWS 공식 문서를 근거로 쓴 예시다(docs/question-data.md §1).
--
-- 유형 4개와 두 형태(1정답/4보기, 2정답/5보기)를 모두 덮는다.
-- 실행: psql ... -1 -f back/seeds/dev_questions.sql
-- 되돌리기: delete from tbl_question;  (tbl_choice 는 on delete cascade 로 따라 지워진다)

-- 유형은 code 로 찾는다. 대리키를 여기 박으면 시드 순서에 묶인다.
with new_question as (
    insert into tbl_question (exam_id, category_id, content, source_urls, status)
    select e.id, c.id, q.content, q.source_urls, 'approved'
    from (values
        ('1.1',
         'EC2에서 도는 애플리케이션이 S3 버킷을 읽어야 한다. 최소 권한 원칙을 지키면서 자격 증명 유출 위험을 없애려면?',
         array['https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html']),
        ('2.1',
         '단일 가용 영역에서 RDS for MySQL을 운영 중이다. AZ 하나에 장애가 나도 데이터베이스가 계속 동작해야 한다. '
         || '애플리케이션 코드를 고치지 않고 달성하려면 어떻게 해야 하는가?',
         array['https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html']),
        ('3.1',
         '전 세계 사용자가 서울 리전의 웹 애플리케이션을 쓴다. 정적 이미지 로딩과 API 응답 모두 먼 지역에서 느리다. '
         || '지연 시간을 줄이려면 무엇을 해야 하는가? 두 가지를 고르시오.',
         array['https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html']),
        ('4.1',
         '스타트업이 사용자 업로드 파일을 S3에 보관한다. 최근 30일 파일은 자주 조회되지만 그 이후 접근 패턴은 예측할 수 없다. '
         || '운영 인력을 늘리지 않으면서 보관 비용을 줄이려면 어떤 방법이 가장 적절한가?',
         array['https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html'])
    ) as q(category_code, content, source_urls)
    join tbl_question_category c on c.code = q.category_code
    cross join (select id from tbl_exam limit 1) e
    returning id, category_id
)
insert into tbl_choice (question_id, marker, content, correct, explanation)
select nq.id, ch.marker, ch.content, ch.correct, ch.explanation
from new_question nq
join tbl_question_category c on c.id = nq.category_id
join (values
    -- 1.1 보안 — IAM 역할
    ('1.1', 'a', 'IAM 사용자 액세스 키를 만들어 애플리케이션 설정 파일에 넣는다', false,
     '장기 자격 증명이 디스크에 남아요. 유출되면 회수할 때까지 계속 쓸 수 있고, 순환도 사람이 해야 해요.'),
    ('1.1', 'b', '버킷 정책에서 모든 주체에게 읽기를 허용한다', false,
     '버킷이 공개돼요. 최소 권한과 정반대고, 데이터 유출 사고의 전형적인 원인이에요.'),
    ('1.1', 'c', '해당 버킷 읽기 권한만 가진 IAM 역할을 EC2 인스턴스에 연결한다', true,
     '임시 자격 증명이 인스턴스 메타데이터로 자동 발급·순환돼요. 저장할 키가 없고 권한 범위도 버킷 하나로 좁힐 수 있어요.'),
    ('1.1', 'd', '루트 계정 자격 증명을 환경변수로 전달한다', false,
     '루트 계정은 모든 권한을 가져요. 어떤 경우에도 애플리케이션에 전달하면 안 돼요.'),

    -- 2.1 복원력 — Multi-AZ
    ('2.1', 'a', '다른 AZ에 읽기 전용 복제본을 만든다', false,
     '읽기 전용 복제본은 읽기 부하를 나누는 기능이에요. 장애가 나도 자동으로 승격되지 않아서 쓰기는 계속 멈춰 있어요.'),
    ('2.1', 'b', 'Multi-AZ 배포를 활성화한다', true,
     '대기 인스턴스를 다른 AZ에 두고 동기 복제해요. 장애가 나면 엔드포인트가 그대로 유지된 채 자동 장애 조치되니까 연결 문자열을 바꾸지 않아도 돼요.'),
    ('2.1', 'c', '자동 스냅샷 주기를 1시간으로 줄인다', false,
     '스냅샷은 복구 수단이지 가용성 수단이 아니에요. 복원하는 동안 서비스는 멈춰 있어요.'),
    ('2.1', 'd', '인스턴스 클래스를 더 큰 것으로 바꾼다', false,
     '성능만 올라갈 뿐 AZ 장애와는 무관해요. 여전히 한 AZ에 의존하고요.'),

    -- 3.1 고성능 — 2정답/5보기
    ('3.1', 'a', 'CloudFront 배포를 앞에 둔다', true,
     '엣지 로케이션에서 정적 콘텐츠를 캐시하고 동적 요청도 AWS 백본으로 태워요. 먼 지역 사용자의 왕복 시간이 줄어들어요.'),
    ('3.1', 'b', 'EC2 인스턴스 타입을 더 큰 것으로 바꾼다', false,
     '처리 능력만 늘어날 뿐 물리적 거리는 그대로예요. 지연 시간의 원인이 연산이 아니라 거리일 때는 효과가 없어요.'),
    ('3.1', 'c', '여러 리전에 배포하고 Route 53 지연 시간 기반 라우팅을 적용한다', true,
     '사용자를 가장 빠른 리전으로 보내요. 동적 요청까지 가까운 곳에서 처리되니까 캐시로 해결되지 않는 부분을 덮어줘요.'),
    ('3.1', 'd', 'S3 버킷에 버전 관리를 켠다', false,
     '실수로 지운 객체를 되살리는 기능이에요. 응답 속도와는 무관해요.'),
    ('3.1', 'e', 'RDS를 Multi-AZ로 바꾼다', false,
     'AZ 장애에 대비하는 가용성 구성이에요. 대기 인스턴스는 읽기를 처리하지 않아서 응답이 빨라지지 않아요.'),

    -- 4.1 비용 최적화 — Intelligent-Tiering
    ('4.1', 'a', 'S3 Intelligent-Tiering을 적용한다', true,
     '접근 패턴을 예측할 수 없을 때 쓰는 클래스예요. 객체별 접근 빈도를 자동으로 추적해 계층을 옮기니까 수명 주기 규칙을 사람이 관리하지 않아도 돼요.'),
    ('4.1', 'b', '30일 후 S3 Glacier Deep Archive로 옮기는 수명 주기 규칙을 만든다', false,
     'Deep Archive는 꺼내는 데 수 시간이 걸려요. 30일 이후에도 조회될 수 있는 파일에 적용하면 사용자가 파일을 즉시 받지 못해요.'),
    ('4.1', 'c', '모든 객체를 S3 Standard-IA에 저장한다', false,
     'Standard-IA는 최소 보관 기간과 검색 요금이 있어요. 자주 조회되는 최근 30일 파일까지 여기 두면 오히려 비용이 늘어나요.'),
    ('4.1', 'd', 'EC2 인스턴스에 EBS 볼륨을 붙여 파일을 옮긴다', false,
     'EBS는 단일 AZ에 묶인 블록 스토리지라 용량을 미리 잡아야 해요. 객체 보관 비용을 줄이는 방향과는 반대예요.')
) as ch(category_code, marker, content, correct, explanation)
  on ch.category_code = c.code;
