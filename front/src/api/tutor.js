/*
 * AI 튜터 응답. 서버가 생기기 전까지 고정 문구를 돌려준다.
 * 실제로는 오답 이력과 "지금 보고 있는 문제"를 함께 보내고 백엔드가 LLM을 호출한다
 * (프런트에서 직접 부르지 않는다).
 *
 * 채점은 여기서 하지 않는다 — 정답은 검수를 거쳐 저장된 데이터이고, AI는 그 결과를 설명만 한다.
 *
 * 이 파일의 말투는 임시가 아니라 **폐기 예정**이다. 서버가 붙는 1단계에서 buildGradeReply는
 * 옮기는 게 아니라 지운다 — 말투를 여기와 서버 프롬프트 두 곳에 두면 갈라진다(docs/backend-contract.md §5).
 */

const REPLY_DELAY_MS = 700

const FOLLOW_UPS = [
  '보기를 지울 때는 요구사항에 없는 조건을 끌어들이는 선택지부터 걸러 보세요.',
  '헷갈리는 지점이 반복되고 있어요. 공식 문서에서 "제한 사항"만 훑어도 오답 보기의 절반은 걸러져요.',
  '같은 함정이 시험에도 자주 나와요. 서비스 이름보다 제약 조건을 먼저 읽어 보세요.',
]

/* 채점 결과를 받아 반응 문장을 만든다. 나중에 이 자리가 LLM 호출로 바뀐다. */
export function buildGradeReply({
  correct,
  correctMarkers,
  correctChoices,
  wrongMarkers,
  wrongChoices,
}) {
  const correctReason = correctChoices.map((choice) => choice.explanation).join('\n')

  if (correct) {
    return `정답이에요!\n${correctReason}`
  }

  const wrongReason = wrongChoices.map((choice) => choice.explanation).join('\n')

  // 보기 기호(A~E)는 받침이 없어 '예요'로 붙는다
  return (
    `정답은 ${correctMarkers}예요.\n${correctReason}\n\n` +
    `${wrongMarkers}의 ${wrongReason}`
  )
}

export function askTutor({ history }) {
  const reply = FOLLOW_UPS[history.length % FOLLOW_UPS.length]

  return new Promise((resolve) => {
    setTimeout(() => resolve(reply), REPLY_DELAY_MS)
  })
}
