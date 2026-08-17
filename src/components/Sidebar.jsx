import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { signOut } from '../api/auth.js'
import { fetchStudySessions } from '../api/sessions.js'
import { fetchCurrentUser } from '../api/user.js'
import { groupSessionsByRecency } from '../features/sessions/grouping.js'
import styles from './Sidebar.module.css'

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

  const groups = sessions === null ? [] : groupSessionsByRecency(sessions, new Date())

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
        결과 분석
      </NavLink>

      <nav className={styles.history} aria-label="학습 기록">
        {sessions === null ? (
          <p className={styles.placeholder}>기록을 불러오는 중입니다.</p>
        ) : groups.length === 0 ? (
          <p className={styles.placeholder}>
            아직 학습 기록이 없습니다. 첫 문제를 풀면 여기에 쌓입니다.
          </p>
        ) : (
          groups.map((group) => (
            <section key={group.label} className={styles.group}>
              <h2 className={styles.groupLabel}>{group.label}</h2>
              <ul className={styles.list}>
                {group.sessions.map((session) => (
                  <li key={session.id}>
                    <NavLink
                      className={styles.item}
                      to={`/study?cert=${session.certCode}`}
                      onClick={onNavigate}
                    >
                      <span className={styles.itemTitle}>{session.title}</span>
                      <span className={styles.itemMeta}>{session.questionCount}문제</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </section>
          ))
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
