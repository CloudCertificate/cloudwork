import { fetchQuestions } from './quiz.js'
import { fetchCertification } from './certifications.js'

/*
 * 시험 세트. 서버가 생기기 전까지 학습용 문제를 그대로 쓴다.
 *
 * 제한 시간은 실제 시험의 문항당 시간을 지금 출제된 문항 수에 그대로 적용해 구한다
 * (SAA-C03은 65문항 130분이라 문항당 2분). 고정값으로 두면 시작 화면이 알리는 시험 정보와
 * 실제로 주어지는 시간이 어긋나고, 문제은행이 65문항으로 차도 값을 따로 고쳐야 한다.
 */
const FALLBACK_SECONDS_PER_QUESTION = 120

function toTimeLimitSeconds(questionCount, certification) {
  if (certification === null) return questionCount * FALLBACK_SECONDS_PER_QUESTION

  const secondsPerQuestion =
    (certification.timeLimitMinutes * 60) / certification.questionCount
  return Math.round(questionCount * secondsPerQuestion)
}

export function fetchExamSet(certCode) {
  return Promise.all([fetchQuestions(certCode), fetchCertification(certCode)]).then(
    ([questions, certification]) => ({
      questions,
      timeLimitSeconds: toTimeLimitSeconds(questions.length, certification),
    }),
  )
}
