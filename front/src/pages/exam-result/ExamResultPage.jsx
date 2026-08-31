import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { fetchQuestions } from '../../api/quiz.js'
import {
  MAX_SCORE,
  PASS_SCORE,
  countCorrect,
  hasReachedPassScore,
  isAnswerCorrect,
  toScaledScore,
} from '../../features/exam/score.js'
import PageLoading from '../../components/PageLoading.jsx'
import styles from './ExamResultPage.module.css'

export default function ExamResultPage() {
  const { state } = useLocation()
  const [questions, setQuestions] = useState(null)

  useEffect(() => {
    if (!state) return
    fetchQuestions(state.examId).then(setQuestions)
  }, [state])

  // 새로고침하면 제출 내역이 사라진다. 서버에 회차를 저장하기 전까지는 다시 응시해야 한다.
  if (!state) {
    return (
      <main className={styles.page}>
        <h1 className={styles.title}>표시할 결과가 없어요</h1>
        <p className={styles.note}>모의고사를 다시 시작해 주세요.</p>
        <Link className={styles.primaryLink} to="/">
          시작 화면으로
        </Link>
      </main>
    )
  }

  if (questions === null) {
    return <PageLoading>채점하는 중이에요.</PageLoading>
  }

  const { answers, examId, flagged = {}, reason } = state
  const flaggedCount = questions.filter((question) => flagged[question.id]).length
  const correctCount = countCorrect(questions, answers)
  const score = toScaledScore(correctCount, questions.length)
  const reached = hasReachedPassScore(score)

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>채점 결과</h1>
      {reason === 'timeout' ? (
        <p className={styles.note}>제한 시간이 끝나서 자동으로 제출했어요.</p>
      ) : null}

      <section className={styles.scoreBox} data-reached={reached}>
        <p className={styles.scoreLabel}>점수</p>
        <p className={styles.score}>
          {score}
          <span className={styles.scoreMax}> / {MAX_SCORE}</span>
        </p>
        <p className={styles.verdict}>{reached ? '합격' : '불합격'}</p>
        <p className={styles.detail}>
          {questions.length}문제 중 {correctCount}문제를 맞혔어요.
          <br />
          합격 점수: {PASS_SCORE}점
        </p>
      </section>

      <h2 className={styles.subtitle}>문항별 결과</h2>
      {flaggedCount > 0 ? (
        <p className={styles.flaggedSummary}>
          표시한 문제가 {flaggedCount}개 있어요. 한 번 더 짚어 보세요!
        </p>
      ) : null}
      <ol className={styles.list}>
        {questions.map((question, index) => {
          const picked = answers[question.id] ?? []
          const isCorrect = isAnswerCorrect(question, picked)

          return (
            <li key={question.id} className={styles.item} data-correct={isCorrect}>
              <span className={styles.itemIndex}>{index + 1}</span>
              <span className={styles.itemBody}>
                <span className={styles.itemDomain}>{question.domain}</span>
                <span className={styles.itemVerdict}>
                  {picked.length > 0 ? (isCorrect ? '정답' : '오답') : '답하지 않음'}
                  {flagged[question.id] ? (
                    <span className={styles.flagTag}>표시함</span>
                  ) : null}
                </span>
              </span>
              <Link className={styles.reviewLink} to={`/study?exam=${examId}&q=${index}`}>
                AI와 복습
              </Link>
            </li>
          )
        })}
      </ol>

      {/* 결과를 다 읽은 뒤 갈 곳이 없으면 사이드바로 나가는 수밖에 없다 */}
      <div className={styles.actions}>
        <Link className={styles.primaryLink} to={`/exam?exam=${examId}`}>
          다시 응시하기
        </Link>
        <Link className={styles.secondaryLink} to="/dashboard">
          분석 보기
        </Link>
      </div>
    </main>
  )
}
