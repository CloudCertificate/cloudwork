/*
 * 출제. 서버가 승인된 문제만 내려준다.
 *
 * answerCount — 골라야 하는 보기 수. 서버가 보기의 correct 를 세어 준다(저장된 값이 아니다).
 * choices[].marker — 보기를 가리키는 계약값('a'~'e'). 화면 표시 글자도 이걸 쓴다.
 * choices[].explanation — AI 말풍선이 그대로 읽는 문장이라 튜터와 같은 해요체다.
 *
 * domain 을 주면 그 유형 문제만 온다 — 취약 유형 학습이 이 필터로 들어온다.
 * 값은 유형 code('1'~'4') 다. 라벨이 아니다(docs/backend-contract.md §1).
 */

import { apiGet } from './client.js'

export function fetchQuestions(examId, { domain } = {}) {
  const query = domain ? `?domain=${encodeURIComponent(domain)}` : ''
  return apiGet(`/exams/${examId}/questions${query}`)
}
