import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { signOut } from '../api/auth.js'
import { fetchStudySessions } from '../api/sessions.js'
import { fetchCurrentUser } from '../api/user.js'
import { sortSessionsByRecent } from '../features/sessions/ordering.js'
import styles from './Sidebar.module.css'

/* 목록이 날짜로 묶이지 않으므로 줄마다 시작일을 적는다. */
function formatStartedAt(isoDateTime) {
  const date = new Date(isoDateTime)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}.${month}.${day}`
}

/* 줄 왼쪽에 붙는 대화 표시. 아이콘이 하나뿐이라 별도 파일로 빼지 않는다. */
function ThreadMark() {
  return (
    <svg
      className={styles.mark}
      viewBox="0 0 16 16"
      width="16"
      height="16"
      aria-hidden="true"
    >
      <path
        d="M2.5 3.5h11v7h-6l-3.5 3v-3h-1.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Sidebar({ onNavigate }) {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetchStudySessions().then(setSessions)
    fetchCurrentUser().then(setUser)
  }, [])

  function handleSignOut() {
    onNavigate?.()
    signOut().then(() => navigate('/login', { replace: true }))
  }

  const ordered = sessions === null ? [] : sortSessionsByRecent(sessions)

  return (
    <div className={styles.sidebar}>
      <NavLink className={styles.logo} to="/" onClick={onNavigate}>
        CloudCertificate
      </NavLink>

      {/* 자격증·모드는 시작 화면에서 고른다 — 여기 드롭다운을 두면 선택 지점이 둘이 된다 */}
      <NavLink className={styles.newStudy} to="/" onClick={onNavigate}>
        새 학습 시작
      </NavLink>

      <NavLink className={styles.analysis} to="/dashboard" onClick={onNavigate}>
        모의고사 분석
      </NavLink>

      <nav className={styles.history} aria-label="학습 기록">
        {sessions === null ? (
          <p className={styles.placeholder}>기록을 불러오는 중입니다.</p>
        ) : ordered.length === 0 ? (
          <p className={styles.placeholder}>
            아직 학습 기록이 없습니다. 첫 문제를 풀면 여기에 쌓입니다.
          </p>
        ) : (
          <ul className={styles.list}>
            {ordered.map((session) => (
              <li key={session.id}>
                <NavLink
                  className={styles.item}
                  to={`/study?cert=${session.certCode}`}
                  onClick={onNavigate}
                >
                  <ThreadMark />
                  <span className={styles.itemTitle}>{session.title}</span>
                  <span className={styles.itemMeta}>
                    <span>{session.questionCount}문제</span>
                    <span>{formatStartedAt(session.startedAt)}</span>
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </nav>

      {user === null ? null : (
        <div className={styles.account}>
          <div className={styles.accountRow}>
            <span className={styles.avatar} aria-hidden="true">
              {user.name.slice(0, 1)}
            </span>
            <span className={styles.accountName}>{user.name}</span>
            <button className={styles.signOut} type="button" onClick={handleSignOut}>
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
