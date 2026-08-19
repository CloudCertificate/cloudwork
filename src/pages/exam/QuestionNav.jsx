import { MARKERS } from '../../components/ChoiceList.jsx'
import styles from './QuestionNav.module.css'

/*
 * 답안지 모양의 문항 목록. 한 줄이 문항 하나이고 고른 보기가 채워진다.
 * 상태를 색만이 아니라 채움·글자로도 알린다.
 *
 * 복수 정답 문항은 "답함"과 "안 함" 사이에 개수를 채우는 중인 상태가 있다 —
 * 하나만 고른 채 제출하면 오답이 되므로 다 고른 것과 같이 보이면 안 된다.
 */
export default function QuestionNav({ questions, answers, flagged, currentIndex, onMove }) {
  return (
    <nav className={styles.nav} aria-label="문항 이동">
      <ol className={styles.list}>
        {questions.map((question, index) => {
          const picked = answers[question.id] ?? []
          const isFlagged = Boolean(flagged[question.id])
          const answerCount = question.answerCount ?? 1
          const isIncomplete = picked.length > 0 && picked.length < answerCount

          return (
            <li key={question.id}>
              <button
                className={styles.row}
                type="button"
                data-current={index === currentIndex}
                data-flagged={isFlagged}
                data-incomplete={isIncomplete}
                aria-current={index === currentIndex ? 'true' : undefined}
                onClick={() => onMove(index)}
              >
                <span className={styles.order}>{index + 1}.</span>
                <span className={styles.marks}>
                  {question.choices.map((choice, choiceIndex) => (
                    <span
                      key={choice.id}
                      className={styles.mark}
                      data-picked={picked.includes(choice.id)}
                    >
                      {MARKERS[choiceIndex]}
                    </span>
                  ))}
                </span>
                {isIncomplete ? (
                  <span className={styles.count}>
                    {picked.length}/{answerCount}
                  </span>
                ) : null}
                <span className={styles.state}>
                  {picked.length === 0 ? '안 함' : isIncomplete ? '고르는 중' : '답함'}
                  {isFlagged ? ', 표시함' : ''}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
