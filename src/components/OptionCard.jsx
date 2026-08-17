import styles from './OptionCard.module.css'

/*
 * 라디오 하나를 카드 모양으로 감싼다. 시작 화면의 자격증·모드 선택과 학습 화면의 보기가 함께 쓴다.
 * 네이티브 input을 그대로 두고 모양만 바꾼다 — 키보드 이동과 그룹 동작을 브라우저가 맡게 하기 위해서다.
 */
export default function OptionCard({
  type = 'radio',
  name,
  value,
  checked,
  onChange,
  disabled = false,
  marker,
  label,
  description,
  status = 'default',
  compact = false,
}) {
  return (
    <label
      className={styles.card}
      data-status={status}
      data-disabled={disabled}
      data-compact={compact}
    >
      <input
        className={styles.radio}
        data-type={type}
        type={type}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      {marker ? <span className={styles.marker}>{marker}</span> : null}
      <span className={styles.body}>
        <span className={styles.label}>{label}</span>
        {description ? <span className={styles.description}>{description}</span> : null}
      </span>
    </label>
  )
}
