/*
 * 서버가 생기기 전까지 하드코딩한다. 화면은 이 함수만 부른다.
 * 문제는 AWS 공식 문서를 근거로 작성한 예시이며 기출문제가 아니다.
 *
 * answerCount — 골라야 하는 보기 수. SAA-C03은 단일 정답이 보기 4개, 복수 정답(2개)이 보기 5개다.
 */

const QUESTIONS = [
  {
    id: 1,
    domain: '비용 최적화',
    answerCount: 1,
    text:
      '스타트업이 사용자 업로드 파일을 S3에 보관한다. 최근 30일 파일은 자주 조회되지만 그 이후 접근 패턴은 예측할 수 없다. ' +
      '운영 인력을 늘리지 않으면서 보관 비용을 줄이려면 어떤 방법이 가장 적절한가?',
    choices: [
      {
        id: 'a',
        text: 'S3 Intelligent-Tiering을 적용한다',
        correct: true,
        rationale:
          '접근 패턴을 예측할 수 없을 때 쓰는 클래스다. 객체별 접근 빈도를 자동으로 추적해 계층을 옮기므로 수명 주기 규칙을 사람이 관리하지 않아도 된다.',
      },
      {
        id: 'b',
        text: '30일 후 S3 Glacier Deep Archive로 옮기는 수명 주기 규칙을 만든다',
        correct: false,
        rationale:
          'Deep Archive는 꺼내는 데 수 시간이 걸린다. 30일 이후에도 조회될 수 있는 파일에 적용하면 사용자가 파일을 즉시 받지 못한다.',
      },
      {
        id: 'c',
        text: '모든 객체를 S3 Standard-IA에 저장한다',
        correct: false,
        rationale:
          'Standard-IA는 최소 보관 기간과 검색 요금이 있다. 자주 조회되는 최근 30일 파일까지 여기 두면 오히려 비용이 늘어난다.',
      },
      {
        id: 'd',
        text: 'EC2 인스턴스에 EBS 볼륨을 붙여 파일을 옮긴다',
        correct: false,
        rationale:
          'EBS는 단일 AZ에 묶인 블록 스토리지이고 용량을 미리 잡아야 한다. 객체 보관 비용을 줄이는 방향과 반대다.',
      },
    ],
  },
  {
    id: 2,
    domain: '고가용성',
    answerCount: 1,
    text:
      '단일 가용 영역에서 RDS for MySQL을 운영 중이다. AZ 하나에 장애가 나도 데이터베이스가 계속 동작해야 한다. ' +
      '애플리케이션 코드를 고치지 않고 달성하려면 어떻게 해야 하는가?',
    choices: [
      {
        id: 'a',
        text: '다른 AZ에 읽기 전용 복제본을 만든다',
        correct: false,
        rationale:
          '읽기 전용 복제본은 읽기 부하를 나누는 기능이다. 장애 시 자동으로 승격되지 않으므로 쓰기는 계속 멈춘다.',
      },
      {
        id: 'b',
        text: 'Multi-AZ 배포를 활성화한다',
        correct: true,
        rationale:
          '대기 인스턴스를 다른 AZ에 두고 동기 복제한다. 장애 시 엔드포인트가 그대로 유지된 채 자동 장애 조치되므로 연결 문자열을 바꾸지 않아도 된다.',
      },
      {
        id: 'c',
        text: '자동 스냅샷 주기를 1시간으로 줄인다',
        correct: false,
        rationale:
          '스냅샷은 복구 수단이지 가용성 수단이 아니다. 복원하는 동안 서비스는 멈춰 있다.',
      },
      {
        id: 'd',
        text: '인스턴스 클래스를 더 큰 것으로 바꾼다',
        correct: false,
        rationale:
          '성능을 올릴 뿐 AZ 장애와는 무관하다. 여전히 한 AZ에 의존한다.',
      },
    ],
  },
  {
    id: 3,
    domain: '보안',
    answerCount: 1,
    text:
      'EC2에서 도는 애플리케이션이 S3 버킷을 읽어야 한다. 최소 권한 원칙을 지키면서 자격 증명 유출 위험을 없애려면?',
    choices: [
      {
        id: 'a',
        text: 'IAM 사용자 액세스 키를 만들어 애플리케이션 설정 파일에 넣는다',
        correct: false,
        rationale:
          '장기 자격 증명이 디스크에 남는다. 유출되면 회수할 때까지 계속 쓸 수 있고, 순환도 사람이 해야 한다.',
      },
      {
        id: 'b',
        text: '버킷 정책에서 모든 주체에게 읽기를 허용한다',
        correct: false,
        rationale:
          '버킷이 공개된다. 최소 권한과 정반대이며 데이터 유출 사고의 전형적인 원인이다.',
      },
      {
        id: 'c',
        text: '해당 버킷 읽기 권한만 가진 IAM 역할을 EC2 인스턴스에 연결한다',
        correct: true,
        rationale:
          '임시 자격 증명이 인스턴스 메타데이터로 자동 발급·순환된다. 저장할 키가 없고 권한 범위도 버킷 하나로 좁힐 수 있다.',
      },
      {
        id: 'd',
        text: '루트 계정 자격 증명을 환경변수로 전달한다',
        correct: false,
        rationale:
          '루트 계정은 모든 권한을 가진다. 어떤 경우에도 애플리케이션에 전달하지 않는다.',
      },
    ],
  },
  {
    id: 4,
    domain: '성능',
    answerCount: 2,
    text:
      '전 세계 사용자가 서울 리전의 웹 애플리케이션을 쓴다. 정적 이미지 로딩과 API 응답 모두 먼 지역에서 느리다. ' +
      '지연 시간을 줄이려면 무엇을 해야 하는가? 두 가지를 고르시오.',
    choices: [
      {
        id: 'a',
        text: 'CloudFront 배포를 앞에 둔다',
        correct: true,
        rationale:
          '엣지 로케이션에서 정적 콘텐츠를 캐시하고 동적 요청도 AWS 백본으로 태운다. 먼 지역 사용자의 왕복 시간이 줄어든다.',
      },
      {
        id: 'b',
        text: 'EC2 인스턴스 타입을 더 큰 것으로 바꾼다',
        correct: false,
        rationale:
          '처리 능력이 늘 뿐 물리적 거리는 그대로다. 지연 시간의 원인이 연산이 아니라 거리일 때는 효과가 없다.',
      },
      {
        id: 'c',
        text: '여러 리전에 배포하고 Route 53 지연 시간 기반 라우팅을 적용한다',
        correct: true,
        rationale:
          '사용자를 가장 빠른 리전으로 보낸다. 동적 요청까지 가까운 곳에서 처리되므로 캐시로 해결되지 않는 부분을 덮는다.',
      },
      {
        id: 'd',
        text: 'S3 버킷에 버전 관리를 켠다',
        correct: false,
        rationale: '실수로 지운 객체를 되살리는 기능이다. 응답 속도와 무관하다.',
      },
      {
        id: 'e',
        text: 'RDS를 Multi-AZ로 바꾼다',
        correct: false,
        rationale:
          'AZ 장애에 대비하는 가용성 구성이다. 대기 인스턴스는 읽기를 처리하지 않아 응답이 빨라지지 않는다.',
      },
    ],
  },
]

/* domain을 주면 그 유형 문제만 돌려준다 — 취약 유형 학습이 이 필터로 들어온다. */
export function fetchQuestions(certCode, { domain } = {}) {
  const filtered = domain
    ? QUESTIONS.filter((question) => question.domain === domain)
    : QUESTIONS

  return Promise.resolve(filtered.map((question) => ({ ...question, certCode })))
}
