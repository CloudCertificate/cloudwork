/*
 * 서버가 생기기 전까지 하드코딩한다.
 * 화면은 이 함수만 부르므로, 백엔드가 붙으면 함수 안을 fetch로 바꾸면 화면은 손대지 않는다.
 */

const CERTIFICATIONS = [
  {
    code: 'SAA-C03',
    name: 'AWS Solutions Architect Associate',
    questionCount: 65,
    timeLimitMinutes: 130,
    available: true,
  },
  {
    // INFO-PROC는 URL·식별용으로 임시로 정한 값이다. 공식 약칭이 아니다.
    code: 'INFO-PROC',
    name: '정보처리기사',
    questionCount: 100,
    timeLimitMinutes: 150,
    available: false,
  },
]

export function fetchCertifications() {
  return Promise.resolve(CERTIFICATIONS)
}

export function fetchCertification(code) {
  return Promise.resolve(
    CERTIFICATIONS.find((certification) => certification.code === code) ?? null,
  )
}
