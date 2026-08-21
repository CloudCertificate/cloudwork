/*
 * 학습 세션 목록. 서버가 생기기 전까지 하드코딩한다.
 * 세션 하나 = 한 번 이어서 진행한 학습(문제 여러 개 + AI 대화)이다.
 * 시험 회차는 여기 들어오지 않는다 — 대화가 아니라 성적표라서 대시보드가 맡는다.
 */

function daysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

const SESSIONS = [
  {
    id: 's-1',
    certCode: 'SAA-C03',
    title: 'S3 스토리지 클래스 비교',
    questionCount: 4,
    startedAt: daysAgo(0),
  },
  {
    id: 's-2',
    certCode: 'SAA-C03',
    title: 'RDS 가용성 구성',
    questionCount: 3,
    startedAt: daysAgo(0),
  },
  {
    id: 's-3',
    certCode: 'SAA-C03',
    title: 'IAM 역할과 액세스 키',
    questionCount: 5,
    startedAt: daysAgo(3),
  },
  {
    id: 's-4',
    certCode: 'SAA-C03',
    title: 'VPC 서브넷 설계',
    questionCount: 6,
    startedAt: daysAgo(10),
  },
]

export function fetchStudySessions() {
  return Promise.resolve(SESSIONS)
}
