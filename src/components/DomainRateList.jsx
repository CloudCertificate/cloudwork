import styles from './DomainRateList.module.css'

const WEAK_THRESHOLD = 0.5

function toPercent(rate) {
  return `${Math.round(rate * 100)}%`
}

/* 학습 화면 사이드바와 대시보드가 함께 쓴다. */
export default function DomainRateList({ domains }) {
  return (
    <ul className={styles.domains}>
      {domains.map((domain) => {
        const isWeak = domain.correctRate < WEAK_THRESHOLD

        return (
          <li key={domain.name} className={styles.domain}>
            <span className={styles.name}>
              {domain.name}
              {isWeak ? <span className={styles.weakTag}>취약</span> : null}
            </span>
            <span className={styles.rate}>{toPercent(domain.correctRate)}</span>
            <span
              className={styles.bar}
              data-weak={isWeak}
              style={{ '--rate': toPercent(domain.correctRate) }}
            />
          </li>
        )
      })}
    </ul>
  )
}
