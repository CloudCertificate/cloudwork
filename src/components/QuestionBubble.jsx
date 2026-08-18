import ChoiceList, { MARKERS } from './ChoiceList.jsx'
import styles from './QuestionBubble.module.css'

/*
 * 말풍선 안에 들어가는 문제. 해설은 여기 붙이지 않는다 — AI 말풍선이 이어서 말한다.
 * firstAnswerIds는 처음 고른 답이다. 다시 골라도 이 값은 바뀌지 않는다(기록에 남는 건 첫 답뿐).
 * 복수 정답 문제는 개수를 채운 뒤 제출해야 채점된다.
 */
export default function QuestionBubble({
  question,
  order,
  selectedIds,
  firstAnswerIds,
  locked,
  onSelect,
  onSubmit,
}) {
  const answerCount = question.answerCount ?? 1
  const multi = answerCount > 1
  const graded = firstAnswerIds !== null

  const firstMarkers = (firstAnswerIds ?? [])
    .map((id) => MARKERS[question.choices.findIndex((choice) => choice.id === id)])
    .join(', ')

  return (
    <div className={styles.question}>
      <p className={styles.meta}>
        {order}번 · {question.domain}
        {multi ? ` · ${answerCount}개 선택` : ''}
      </p>
      <p className={styles.text}>{question.text}</p>

      <ChoiceList
        name={`choice-${question.id}`}
        choices={question.choices}
        selectedIds={selectedIds}
        onSelect={onSelect}
        answerCount={answerCount}
        graded={graded}
        locked={locked}
        showRationale={false}
        compact
      />

      {multi && !locked ? (
        <button
          className={styles.submit}
          type="button"
          disabled={selectedIds.length !== answerCount}
          onClick={onSubmit}
        >
          답 제출하기 ({selectedIds.length}/{answerCount})
        </button>
      ) : null}

      {graded ? <p className={styles.firstAnswer}>첫 답: {firstMarkers}</p> : null}
    </div>
  )
}
