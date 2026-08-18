import styles from './QuestionCard.module.css'

/*
 * 문항 카드. 문제가 바뀌면 body만 갈아끼워 등장 애니메이션이 다시 돈다(bodyKey).
 *
 * footer(◀ ▶ 제출)를 children과 나눠 받는 이유는 애니메이션 때문이다 — 이동 버튼이 갈아끼워지는
 * 영역 안에 있으면 ▶를 누른 순간 그 버튼이 사라져 키보드 포커스가 body로 튄다. 헤더와 footer는
 * 문항이 바뀌어도 살아 있어야 한다.
 */
export default function QuestionCard({
  index,
  total,
  domain,
  text,
  action,
  bodyKey,
  direction,
  footer,
  children,
}) {
  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <span className={styles.progress}>
          {index + 1} / {total}
        </span>
        <span className={styles.domain}>{domain}</span>
        {action ? <div className={styles.action}>{action}</div> : null}
      </header>

      <div key={bodyKey} className={styles.body} data-direction={direction}>
        <h2 className={styles.question}>{text}</h2>
        {children}
      </div>

      {footer}
    </article>
  )
}
