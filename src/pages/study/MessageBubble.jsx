import styles from './MessageBubble.module.css'

export default function MessageBubble({ role, children }) {
  return (
    <li className={styles.row} data-role={role}>
      <div className={styles.bubble} data-role={role}>
        {children}
      </div>
    </li>
  )
}
