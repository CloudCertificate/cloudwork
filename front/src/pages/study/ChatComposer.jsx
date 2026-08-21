import styles from './ChatComposer.module.css'

/*
 * actions — 보내기 왼쪽에 서는 흐름 버튼(다음 문제 / 학습 마치기).
 * 말풍선이 아니라 여기 있는 이유는 앱이 권하는 것이 아니라 사용자가 쓰는 도구이기 때문이다.
 * 자리가 고정이라 "가장 최근 말풍선에만 살린다" 같은 규칙도 필요 없다.
 */
export default function ChatComposer({ draft, onDraftChange, onSend, waiting, actions }) {
  function handleSubmit(event) {
    event.preventDefault()
    onSend()
  }

  return (
    <form className={styles.composer} onSubmit={handleSubmit}>
      <label className={styles.label} htmlFor="tutor-input">
        AI 튜터에게 질문
      </label>
      <input
        id="tutor-input"
        className={styles.input}
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        placeholder="메시지를 입력하세요"
        autoComplete="off"
      />
      {actions}
      <button className={styles.send} type="submit" disabled={!draft.trim() || waiting}>
        보내기
      </button>
    </form>
  )
}
