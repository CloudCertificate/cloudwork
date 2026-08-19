import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchExamHistory } from '../../api/analytics.js'
import { MAX_SCORE, PASS_SCORE, hasReachedPassScore } from '../../features/exam/score.js'
import {
  forecastLevel,
  isWeakDomain,
  mean,
  probabilityOfReaching,
  probabilitySeries,
  standardDeviation,
} from '../../features/analytics/stats.js'
import ScoreChart from './ScoreChart.jsx'
import DomainRateList from './DomainRateList.jsx'
import PageLoading from '../../components/PageLoading.jsx'
import styles from './DashboardPage.module.css'

const RECENT_ATTEMPT_COUNT = 5

function formatDate(isoDate) {
  return isoDate.replaceAll('-', '.')
}

export default function DashboardPage() {
  const [history, setHistory] = useState(null)
  const [showAllAttempts, setShowAllAttempts] = useState(false)

  useEffect(() => {
    fetchExamHistory().then(setHistory)
  }, [])

  if (history === null) {
    return <PageLoading>기록을 불러오는 중이에요.</PageLoading>
  }

  const scores = history.attempts.map((attempt) => attempt.score)

  if (scores.length === 0) {
    return (
      <main className={styles.page}>
        <h1 className={styles.title}>모의고사 분석</h1>
        <p className={styles.empty}>
          아직 모의고사 결과가 없어요. 첫 응시를 마치면 추이와 유형별 정답률이 쌓여요.
        </p>
        <Link className={styles.primaryLink} to="/">
          모의고사 보러 가기
        </Link>
      </main>
    )
  }

  const probability = probabilityOfReaching(scores, PASS_SCORE)
  // 표시값과 등급색이 같은 수를 보도록 여기서 한 번만 반올림한다
  const probabilityPercent = probability === null ? null : Math.round(probability * 100)
  const weakest = [...history.domains].sort((a, b) => a.correctRate - b.correctRate)[0]
  const flaggedDomains = [...history.domains].sort(
    (a, b) => b.flaggedCount - a.flaggedCount,
  )
  // 최신 회차가 위로 온다. 회차 번호는 응시 순서라 뒤집기 전에 붙인다
  const allAttempts = history.attempts
    .map((attempt, index) => ({ ...attempt, order: index + 1 }))
    .reverse()
  const shownAttempts = showAllAttempts
    ? allAttempts
    : allAttempts.slice(0, RECENT_ATTEMPT_COUNT)
  const hasMoreAttempts = allAttempts.length > RECENT_ATTEMPT_COUNT

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>모의고사 분석</h1>
      <p className={styles.scope}>모의고사 기록만 써요. AI 학습은 집계에 넣지 않아요.</p>

      <dl className={styles.kpis}>
        <div className={styles.kpi}>
          <dt className={styles.kpiLabel}>응시 횟수</dt>
          <dd className={styles.kpiValue}>{scores.length}회</dd>
        </div>
        <div className={styles.kpi}>
          <dt className={styles.kpiLabel}>평균 점수</dt>
          <dd className={styles.kpiValue}>{Math.round(mean(scores))}점</dd>
        </div>
        <div className={styles.kpi}>
          <dt className={styles.kpiLabel}>표준편차</dt>
          <dd className={styles.kpiValue}>{Math.round(standardDeviation(scores))}점</dd>
        </div>
      </dl>

      {/* 제목 대신 aria-label로 이름을 준다 — 축과 범례가 무슨 그래프인지 이미 말한다 */}
      <section className={styles.card} aria-label="회차별 점수 추이">
        {probabilityPercent === null ? null : (
          <div className={styles.forecastRow}>
            <p className={styles.forecast}>
              다음 모의고사 합격률은{' '}
              <strong
                className={styles.forecastValue}
                data-level={forecastLevel(probabilityPercent)}
              >
                {probabilityPercent}%
              </strong>
              예요.
            </p>
            <p className={styles.cardNote}>*실제 시험 합격 여부를 예측하지 않아요.</p>
          </div>
        )}

        <ScoreChart
          scores={scores}
          passProbabilities={probabilitySeries(scores, PASS_SCORE)}
          passScore={PASS_SCORE}
          maxScore={MAX_SCORE}
        />
      </section>

      <div className={styles.columns}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>유형별 정답률</h2>
          <DomainRateList domains={history.domains} />
          <p className={styles.cardNote}>
            {weakest.name} 유형이 가장 약하네요.{' '}
            <Link
              className={styles.inlineLink}
              to={`/study?cert=${history.certCode}&domain=${encodeURIComponent(weakest.name)}`}
            >
              취약 유형 공부하기
            </Link>
          </p>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>자주 표시한 유형</h2>
          <ul className={styles.flagList}>
            {flaggedDomains.map((domain) => (
              <li key={domain.name} className={styles.flagRow}>
                <span>{domain.name}</span>
                <span className={styles.flagMeta}>
                  정답률{' '}
                  <strong
                    className={styles.flagRate}
                    data-weak={isWeakDomain(domain.correctRate)}
                  >
                    {Math.round(domain.correctRate * 100)}%
                  </strong>{' '}
                  · 표시 {domain.flaggedCount}회
                </span>
              </li>
            ))}
          </ul>
          <p className={styles.cardNote}>
            *&lsquo;나중에 다시 보기&rsquo;로 표시한 유형이에요.
          </p>
        </section>
      </div>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>응시 기록</h2>
        <ol className={styles.attempts}>
          {shownAttempts.map((attempt) => {
            const reached = hasReachedPassScore(attempt.score)

            return (
              <li key={attempt.id} className={styles.attempt} data-reached={reached}>
                <span className={styles.attemptOrder}>{attempt.order}회차</span>
                <span className={styles.attemptDate}>{formatDate(attempt.date)}</span>
                <span className={styles.attemptFlagged}>표시 {attempt.flaggedCount}</span>
                <span className={styles.attemptScore}>{attempt.score}점</span>
                <span className={styles.attemptVerdict}>{reached ? '합격' : '불합격'}</span>
              </li>
            )
          })}
        </ol>

        {hasMoreAttempts ? (
          <button
            className={styles.toggleAttempts}
            type="button"
            aria-expanded={showAllAttempts}
            onClick={() => setShowAllAttempts((current) => !current)}
          >
            {showAllAttempts ? '접기' : `전체 ${allAttempts.length}회 보기`}
          </button>
        ) : null}
      </section>
    </main>
  )
}
