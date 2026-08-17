import { fetchQuestions } from './quiz.js'

/*
 * 시험 세트. 서버가 생기기 전까지 학습용 문제를 그대로 쓴다.
 * 제한 시간은 자격증별 실제 시험 시간이 아니라, 지금 준비된 문항 수에 맞춘 값이다.
 */
const TIME_LIMIT_SECONDS = 300

export function fetchExamSet(certCode) {
  return fetchQuestions(certCode).then((questions) => ({
    questions,
    timeLimitSeconds: TIME_LIMIT_SECONDS,
  }))
}
