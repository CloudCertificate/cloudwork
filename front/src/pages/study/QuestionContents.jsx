import ChoiceList from '../../components/ChoiceList.jsx'
import { domainLabel } from '../../features/domains.js'
import styles from './QuestionContents.module.css'

/*
 * 말풍선 "안에 담기는" 문제다 — 풍선 자체(테두리·배경·좌우 정렬)는 MessageBubble이 그린다.
 * 해설은 여기 붙이지 않는다. AI 말풍선이 이어서 말한다.
 * 채점되면 보기가 잠긴다. 한 문제에 답은 한 번뿐이라 되돌리는 길은 없다.
 * 복수 정답 문제는 개수를 채운 뒤 제출해야 채점된다.
 */
export default function QuestionContents({
  question,
  order,
  selectedMarkers,
  graded,
  onSelect,
  onSubmit,
}) {
  const answerCount = question.answerCount ?? 1
  const multi = answerCount > 1

  return (
    <div className={styles.question}>
      <p className={styles.meta}>
        {order}번 · {domainLabel(question.domainCode)}
        {multi ? ` · ${answerCount}개 선택` : ''}
      </p>
      <p className={styles.text}>{question.content}</p>

      <ChoiceList
        name={`choice-${question.id}`}
        choices={question.choices}
        selectedMarkers={selectedMarkers}
        onSelect={onSelect}
        answerCount={answerCount}
        graded={graded}
        showRationale={false}
        compact
      />

      {multi && !graded ? (
        <button
          className={styles.submit}
          type="button"
          disabled={selectedMarkers.length !== answerCount}
          onClick={onSubmit}
        >
          답 제출하기 ({selectedMarkers.length}/{answerCount})
        </button>
      ) : null}
    </div>
  )
}
