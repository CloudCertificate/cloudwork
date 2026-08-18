import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchCertifications } from '../../api/certifications.js'
import OptionCard from '../../components/OptionCard.jsx'
import PageLoading from '../../components/PageLoading.jsx'
import styles from './StartPage.module.css'

const MODES = [
  { id: 'study', label: 'AI 학습', description: '한 문제씩 풀고 AI와 함께 복습합니다.' },
  { id: 'exam', label: '모의고사', description: '실제 시험처럼 한 번에 풀고 채점합니다.' },
]

export default function StartPage() {
  const navigate = useNavigate()
  const [certifications, setCertifications] = useState(null)
  const [certCode, setCertCode] = useState('')
  const [mode, setMode] = useState('')

  useEffect(() => {
    fetchCertifications().then(setCertifications)
  }, [])

  function handleSubmit(event) {
    event.preventDefault()
    navigate(`/${mode}?cert=${certCode}`)
  }

  if (certifications === null) {
    return <PageLoading>자격증 목록을 불러오는 중입니다.</PageLoading>
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>어떤 시험을 준비하시나요?</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <fieldset className={styles.group}>
          <legend className={styles.legend}>자격증</legend>
          {certifications.map((certification) => (
            <OptionCard
              key={certification.code}
              name="certification"
              value={certification.code}
              checked={certCode === certification.code}
              disabled={!certification.available}
              onChange={(event) => setCertCode(event.target.value)}
              label={
                certification.available
                  ? certification.name
                  : `${certification.name} (준비 중)`
              }
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

        <button className={styles.submit} type="submit" disabled={!certCode || !mode}>
          시작하기
        </button>
      </form>
    </main>
  )
}
