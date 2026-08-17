import { MARKERS } from './ChoiceList.jsx'
import styles from './QuestionNav.module.css'

/*
 * 답안지 모양의 문항 목록. 한 줄이 문항 하나이고 고른 보기가 채워진다.
 * 상태를 색만이 아니라 채움·글자로도 알린다.
 */
export default function QuestionNav({ questions, answers, flagged, currentIndex, onMove }) {
  return (
    <nav className={styles.nav} aria-label="문항 이동">
      <ol className={styles.list}>
        {questions.map((question, index) => {
          const picked = answers[question.id] ?? []
          const isFlagged = Boolean(flagged[question.id])

          return (
            <li key={question.id}>
              <button
                className={styles.row}
                type="button"
                data-current={index === currentIndex}
                data-flagged={isFlagged}
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
                <span className={styles.state}>
                  {picked.length > 0 ? '답함' : '안 함'}
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
