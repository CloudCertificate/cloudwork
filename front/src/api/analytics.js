/*
 * 분석 데이터. 서버가 생기기 전까지 하드코딩한다.
 * 집계 대상은 모의고사 회차뿐이다 — 유형별 정답률과 취약 유형도 마찬가지다.
 * 학습 기록은 AI 대화 맥락으로만 쓰고 여기 들어오지 않는다.
 */
const EXAM_HISTORY = {
  examId: 1,
  attempts: [
    { id: 1, date: '2026-07-12', score: 520, flaggedCount: 3 },
    { id: 2, date: '2026-07-19', score: 580, flaggedCount: 4 },
    { id: 3, date: '2026-07-27', score: 640, flaggedCount: 2 },
    { id: 4, date: '2026-08-02', score: 700, flaggedCount: 5 },
    { id: 5, date: '2026-08-09', score: 680, flaggedCount: 1 },
    { id: 6, date: '2026-08-16', score: 760, flaggedCount: 2 },
  ],
  // flaggedCount — 모의고사에서 '나중에 다시 보기'로 표시한 횟수.
  // 정답률로는 안 보이는 "맞았지만 확신 없던" 영역을 드러낸다(점수에는 영향 없음).
  domains: [
    { name: '비용 최적화', correctRate: 0.45, flaggedCount: 1 },
    { name: '보안', correctRate: 0.58, flaggedCount: 3 },
    { name: '고가용성', correctRate: 0.72, flaggedCount: 4 },
    { name: '성능', correctRate: 0.81, flaggedCount: 9 },
  ],
}

export function fetchExamHistory() {
  return Promise.resolve(EXAM_HISTORY)
}
