import styles from './PageLoading.module.css'

/*
 * 화면이 데이터를 기다리는 동안 띄우는 한 줄. 다섯 화면이 같은 모양을 쓰던 걸 여기로 올렸다.
 * 문구는 화면마다 다르니 children으로 받는다 — "무엇을" 기다리는지가 화면마다 다르다.
 */
export default function PageLoading({ children }) {
  return <p className={styles.loading}>{children}</p>
}
