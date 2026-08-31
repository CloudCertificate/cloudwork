import OptionCard from './OptionCard.jsx'
import styles from './ChoiceList.module.css'

/*
 * selectedMarkers — 고른 보기의 marker 배열('a'~'e'). 단일 정답 문제도 배열로 다룬다(분기를 한 곳으로 모은다).
 * answerCount — 골라야 하는 개수. 2 이상이면 체크박스가 된다.
 * graded — 정오답 색을 입힐지. 채점되면 그대로 잠긴다(한 문제에 답은 한 번뿐이다)
 * showRationale — 보기마다 해설을 붙일지(채팅에서는 해설을 AI 말풍선이 맡는다)
 */
export default function ChoiceList({
  choices,
  selectedMarkers,
  onSelect,
  answerCount = 1,
  graded,
  showRationale = true,
  compact = false,
  name = 'choice',
}) {
  const multi = answerCount > 1

  return (
    <div className={styles.list}>
      {choices.map((choice) => {
        const isSelected = selectedMarkers.includes(choice.marker)
        let status = 'default'
        let description

        if (graded) {
          if (choice.correct) {
            status = 'correct'
            if (showRationale) description = `정답 — ${choice.explanation}`
          } else if (isSelected) {
            status = 'wrong'
            if (showRationale) description = `내가 고른 답 — ${choice.explanation}`
          } else if (showRationale) {
            description = choice.explanation
          }
        }

        return (
          <OptionCard
            key={choice.marker}
            type={multi ? 'checkbox' : 'radio'}
            name={multi ? `${name}-${choice.marker}` : name}
            value={choice.marker}
            checked={isSelected}
            disabled={graded}
            onChange={() => onSelect(choice.marker)}
            marker={choice.marker.toUpperCase()}
            label={choice.content}
            description={description}
            status={status}
            compact={compact}
          />
        )
      })}
    </div>
  )
}
