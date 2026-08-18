import OptionCard from './OptionCard.jsx'
import styles from './ChoiceList.module.css'

const MARKERS = ['A', 'B', 'C', 'D', 'E']

/*
 * selectedIds — 고른 보기 id 배열. 단일 정답 문제도 배열로 다룬다(분기를 한 곳으로 모은다).
 * answerCount — 골라야 하는 개수. 2 이상이면 체크박스가 된다.
 * graded — 정오답 색을 입힐지 / locked — 더 이상 고를 수 없는지
 * showRationale — 보기마다 해설을 붙일지(채팅에서는 해설을 AI 말풍선이 맡는다)
 */
export default function ChoiceList({
  choices,
  selectedIds,
  onSelect,
  answerCount = 1,
  graded,
  locked = graded,
  showRationale = true,
  compact = false,
  name = 'choice',
}) {
  const multi = answerCount > 1

  return (
    <div className={styles.list}>
      {choices.map((choice, index) => {
        const isSelected = selectedIds.includes(choice.id)
        let status = 'default'
        let description

        if (graded) {
          if (choice.correct) {
            status = 'correct'
            if (showRationale) description = `정답 — ${choice.rationale}`
          } else if (isSelected) {
            status = 'wrong'
            if (showRationale) description = `내가 고른 답 — ${choice.rationale}`
          } else if (showRationale) {
            description = choice.rationale
          }
        }

        return (
          <OptionCard
            key={choice.id}
            type={multi ? 'checkbox' : 'radio'}
            name={multi ? `${name}-${choice.id}` : name}
            value={choice.id}
            checked={isSelected}
            disabled={locked}
            onChange={() => onSelect(choice.id)}
            marker={MARKERS[index]}
            label={choice.text}
            description={description}
            status={status}
            compact={compact}
          />
        )
      })}
    </div>
  )
}

export { MARKERS }
