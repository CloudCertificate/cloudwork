import styles from './ChatComposer.module.css'

export default function ChatComposer({ draft, onDraftChange, onSend, waiting }) {
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
        placeholder="메세지를 입력하세요..."
        autoComplete="off"
      />
      <button className={styles.send} type="submit" disabled={!draft.trim() || waiting}>
        보내기
      </button>
    </form>
  )
}
