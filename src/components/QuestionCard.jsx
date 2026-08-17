import styles from './QuestionCard.module.css'

export default function QuestionCard({ index, total, domain, text, action, children }) {
  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <span className={styles.progress}>
          {index + 1} / {total}
        </span>
        <span className={styles.domain}>{domain}</span>
        {action ? <div className={styles.action}>{action}</div> : null}
      </header>

      <h2 className={styles.question}>{text}</h2>

      {children}
    </article>
  )
}
