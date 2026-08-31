/*
 * 채점·환산은 순수 함수로 둔다. 화면과 떼어 놓아야 값만 넣고 검증할 수 있다.
 * 실제 SAA-C03은 1000점 만점에 720점이 합격선이지만, 여기서 내는 점수는 정답률 기반 자체 환산이다.
 *
 * answers는 { [questionId]: ['a', 'c'] } 형태다. 단일 정답 문제도 배열로 다룬다.
 */

export const MAX_SCORE = 1000
export const PASS_SCORE = 720

/* 복수 정답은 정답 집합과 정확히 같아야 맞은 것으로 센다(부분 점수 없음). */
export function isAnswerCorrect(question, picked = []) {
  const correctIds = question.choices
    .filter((choice) => choice.correct)
    .map((choice) => choice.marker)
  if (picked.length !== correctIds.length) return false
  return correctIds.every((id) => picked.includes(id))
}

export function countCorrect(questions, answers) {
  return questions.filter((question) => isAnswerCorrect(question, answers[question.id]))
    .length
}

export function toScaledScore(correctCount, total) {
  if (total === 0) return 0
  return Math.round((correctCount / total) * MAX_SCORE)
}

export function hasReachedPassScore(score) {
  return score >= PASS_SCORE
}
