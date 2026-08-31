import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchExams } from '../../api/exams.js'
import OptionCard from '../../components/OptionCard.jsx'
import PageLoading from '../../components/PageLoading.jsx'
import styles from './StartPage.module.css'

const MODES = [
  { id: 'study', label: 'AI 학습', description: '한 문제씩 풀고 AI와 함께 복습해요.' },
  { id: 'exam', label: '모의고사', description: '실제 시험처럼 한 번에 풀고 채점해요.' },
]

export default function StartPage() {
  const navigate = useNavigate()
  const [exams, setExams] = useState(null)
  const [examId, setExamId] = useState('')
  const [mode, setMode] = useState('')

  useEffect(() => {
    fetchExams().then(setExams)
  }, [])

  function handleSubmit(event) {
    event.preventDefault()
    navigate(`/${mode}?exam=${examId}`)
  }

  if (exams === null) {
    return <PageLoading>자격증 목록을 불러오는 중이에요.</PageLoading>
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>어떤 시험을 준비하시나요?</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <fieldset className={styles.group}>
          <legend className={styles.legend}>자격증</legend>
          {exams.map((exam) => (
            <OptionCard
              key={exam.id}
              name="exam"
              value={String(exam.id)}
              checked={examId === String(exam.id)}
              disabled={!exam.available}
              onChange={(event) => setExamId(event.target.value)}
              label={exam.available ? exam.name : `${exam.name} (준비 중)`}
              /* 실제 시험 기준이다. 지금 모의고사는 준비된 문항 수만큼 나오고 시간도 그만큼 준다 */
              description={`실제 시험 ${exam.questionCount}문항 · ${exam.timeLimitMinutes}분`}
            />
          ))}
        </fieldset>

        <fieldset className={styles.group}>
          <legend className={styles.legend}>모드</legend>
          {MODES.map((item) => (
            <OptionCard
              key={item.id}
              name="mode"
              value={item.id}
              checked={mode === item.id}
              onChange={(event) => setMode(event.target.value)}
              label={item.label}
              description={item.description}
            />
          ))}
        </fieldset>

        <button className={styles.submit} type="submit" disabled={!examId || !mode}>
          시작하기
        </button>
      </form>
    </main>
  )
}
