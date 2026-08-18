import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import styles from './AppLayout.module.css'

/* 사이드바는 좁은 화면에서만 접힌다. 넓은 화면에서는 늘 펼쳐 둔다. */
export default function AppLayout() {
  const [open, setOpen] = useState(false)

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
