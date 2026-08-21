import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import styles from './AppLayout.module.css'

/* 사이드바는 좁은 화면에서만 접힌다. 넓은 화면에서는 늘 펼쳐 둔다. */
export default function AppLayout() {
  const [open, setOpen] = useState(false)

  // 가림막을 덮고 뜨는 서랍이라 Esc로도 닫힌다. 마우스로 가림막을 누르는 것과 같은 동작이다
  useEffect(() => {
    if (!open) return

    function closeOnEscape(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])

  return (
    <div className={styles.shell}>
      <aside className={styles.aside} data-open={open}>
        <Sidebar onNavigate={() => setOpen(false)} />
      </aside>

      {open ? (
        <button
          className={styles.backdrop}
          type="button"
          aria-label="사이드바 닫기"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className={styles.content}>
        <button
          className={styles.toggle}
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          메뉴
        </button>
        <Outlet />
      </div>
    </div>
  )
}
