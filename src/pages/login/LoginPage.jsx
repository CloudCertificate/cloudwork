import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithGoogle } from '../../api/auth.js'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)

  function handleGoogleSignIn() {
    setPending(true)
    signInWithGoogle().then(() => navigate('/', { replace: true }))
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>CloudCertificate</h1>
        <p className={styles.lead}>AWS 자격증, 틀린 문제부터 AI와 함께 짚어 봅니다.</p>

        <div className={styles.providers}>
          <button
            className={styles.google}
            type="button"
            onClick={handleGoogleSignIn}
            disabled={pending}
          >
            {pending ? '연결하는 중입니다' : '구글로 계속하기'}
          </button>
          <button className={styles.kakao} type="button" disabled>
            카카오로 계속하기 (준비 중)
          </button>
        </div>

        <p className={styles.note}>사이트 이용시 로그인이 필요합니다.</p>
      </div>
    </main>
  )
}
