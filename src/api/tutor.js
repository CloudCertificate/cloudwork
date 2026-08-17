/*
 * AI 튜터 응답. 서버가 생기기 전까지 고정 문구를 돌려준다.
 * 실제로는 오답 이력과 "지금 보고 있는 문제"를 함께 보내고 백엔드가 LLM을 호출한다
 * (프런트에서 직접 부르지 않는다).
 *
 * 채점은 여기서 하지 않는다 — 정답은 검수를 거쳐 저장된 데이터이고, AI는 그 결과를 설명만 한다.
 */

const REPLY_DELAY_MS = 700

const FOLLOW_UPS = [
  '보기를 지울 때는 요구사항에 없는 조건을 끌어들이는 선택지부터 걸러 보세요.',
  '헷갈리는 지점이 반복되고 있습니다. 공식 문서의 "제한 사항"만 훑어도 오답 보기의 절반이 걸러집니다.',
  '같은 함정이 시험에도 자주 나옵니다. 서비스 이름보다 제약 조건을 먼저 읽어 보세요.',
]

/* 채점 결과를 받아 반응 문장을 만든다. 나중에 이 자리가 LLM 호출로 바뀐다. */
export function buildGradeReply({
  correct,
  correctMarkers,
  correctChoices,
  pickedChoices,
  retry,
}) {
  const correctReason = correctChoices.map((choice) => choice.rationale).join('\n')
  const pickedReason = pickedChoices
    .filter((choice) => !choice.correct)
    .map((choice) => choice.rationale)
    .join('\n')

  if (retry) {
    return correct ? `이번엔 맞았습니다. ${correctReason}` : `아직 아닙니다. ${pickedReason}`
  }

  if (correct) {
    return `정답입니다.\n${correctReason}\n\n왜 이 답을 골랐는지 말해 주시면 더 짚어 드릴게요.`
  }

  return (
    `아쉽네요. 정답은 ${correctMarkers}입니다.\n${correctReason}\n\n` +
    `고르신 답은 이렇습니다.\n${pickedReason}\n\n왜 그 답을 고르셨나요?`
  )
}

export function askTutor({ history }) {
  const reply = FOLLOW_UPS[history.length % FOLLOW_UPS.length]

  return new Promise((resolve) => {
    setTimeout(() => resolve(reply), REPLY_DELAY_MS)
  })
}
