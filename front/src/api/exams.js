/*
 * 시험 목록. 시작 화면이 고르는 대상이다.
 *
 * available 은 서버가 계산해서 준다 — 승인된 문제가 있으면 고를 수 있다.
 * 프런트가 문제 수를 세어 판단하지 않는다(docs/schema.md).
 */

import { apiGet } from './client.js'

export function fetchExams() {
  return apiGet('/exams')
}

/* 목록에서 하나를 고른다. 시험이 몇 개 안 되므로 전용 엔드포인트를 만들지 않는다. */
export function fetchExam(examId) {
  return fetchExams().then(
    (exams) => exams.find((exam) => String(exam.id) === String(examId)) ?? null,
  )
}
