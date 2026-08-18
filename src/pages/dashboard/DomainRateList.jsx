import { isWeakDomain } from '../../features/analytics/stats.js'
import styles from './DomainRateList.module.css'

function toPercent(rate) {
  return `${Math.round(rate * 100)}%`
}

/* 지금은 대시보드만 쓴다. 취약 유형 표시 기준은 stats.js가 소유한다. */
export default function DomainRateList({ domains }) {
  return (
    <ul className={styles.domains}>
      {domains.map((domain) => {
        const isWeak = isWeakDomain(domain.correctRate)

        return (
          <li key={domain.name} className={styles.domain}>
            <span className={styles.name}>
              {domain.name}
              {isWeak ? <span className={styles.weakTag}>취약</span> : null}
            </span>
            <span className={styles.rate} data-weak={isWeak}>
              {toPercent(domain.correctRate)}
            </span>
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
