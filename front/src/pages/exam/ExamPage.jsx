import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchExamSet } from '../../api/exam.js'
import QuestionCard from './QuestionCard.jsx'
import ChoiceList from '../../components/ChoiceList.jsx'
import QuestionNav from './QuestionNav.jsx'
import PageLoading from '../../components/PageLoading.jsx'
import styles from './ExamPage.module.css'

const LOW_TIME_SECONDS = 60
const TICK_MS = 1000

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function ExamPage() {
  const [searchParams] = useSearchParams()
  const certCode = searchParams.get('cert')
  const navigate = useNavigate()

  const [examSet, setExamSet] = useState(null)
  const [index, setIndex] = useState(0)
  // 문항 전환 애니메이션이 들어오는 쪽. 답안지에서 건너뛸 때도 앞뒤는 정해진다
  const [direction, setDirection] = useState('forward')
  // { [questionId]: ['a', 'c'] } — 단일 정답 문제도 배열로 다룬다
  const [answers, setAnswers] = useState({})
  // 찍었거나 애매한 문제에 다는 표시. 채점·점수에는 영향을 주지 않는다(docs/analytics.md §2)
  const [flagged, setFlagged] = useState({})
  // 남은 시간은 마감 시각에서 계산한다 — 아래 타이머 주석 참고
  const [deadline, setDeadline] = useState(null)
  const [remainingSeconds, setRemainingSeconds] = useState(null)
  const [confirming, setConfirming] = useState(false)
  const dialogRef = useRef(null)

  useEffect(() => {
    fetchExamSet(certCode).then((set) => {
      setExamSet(set)
      setRemainingSeconds(set.timeLimitSeconds)
      setDeadline(Date.now() + set.timeLimitSeconds * 1000)
    })
  }, [certCode])

  const submit = useCallback(
    (reason) => {
      navigate('/exam/result', {
        replace: true,
        state: { certCode, answers, flagged, reason },
      })
    },
    [answers, certCode, flagged, navigate],
  )

  /*
   * 제출 함수는 답안이 바뀔 때마다 새로 만들어진다. 타이머가 그것에 의존하면 보기를 고를 때마다
   * 타이머가 처음부터 다시 시작해 1초 안에 연달아 고르는 동안 시간이 흐르지 않는다 — ref로 최신 것만 들고 있는다.
   */
  const submitRef = useRef(submit)
  useEffect(() => {
    submitRef.current = submit
  }, [submit])

  /*
   * 남은 시간은 세지 않고 마감 시각에서 뺀다. 1초짜리 타이머를 이어 붙이면 매번 조금씩 밀리고,
   * 탭이 뒤로 가 있는 동안 브라우저가 타이머를 늦추면 시계가 실제보다 느리게 간다.
   */
  useEffect(() => {
    if (deadline === null) return

    const timer = setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setRemainingSeconds(left)

      if (left === 0) {
        clearInterval(timer)
        submitRef.current('timeout')
      }
    }, TICK_MS)

    return () => clearInterval(timer)
  }, [deadline])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (confirming) dialog.showModal()
    else if (dialog.open) dialog.close()
  }, [confirming])

  if (examSet === null) {
    return <PageLoading>모의고사 문제를 불러오는 중이에요.</PageLoading>
  }

  const { questions } = examSet
  const question = questions[index]
  const picked = answers[question.id] ?? []
  const answerCount = question.answerCount ?? 1
  // 복수 정답을 하나만 고른 문항도 미완성이다 — 그대로 제출하면 오답으로 채점된다
  const incompleteCount = questions.filter(
    (item) => (answers[item.id] ?? []).length !== (item.answerCount ?? 1),
  ).length
  const isLowTime = remainingSeconds !== null && remainingSeconds <= LOW_TIME_SECONDS

  function selectChoice(choiceId) {
    setAnswers((current) => {
      const currentPicked = current[question.id] ?? []

      if (answerCount === 1) return { ...current, [question.id]: [choiceId] }
      if (currentPicked.includes(choiceId)) {
        return { ...current, [question.id]: currentPicked.filter((id) => id !== choiceId) }
      }
      // 정해진 개수를 넘겨 고르지 못하게 막는다 — 개수 안내가 옆에 떠 있다
      if (currentPicked.length >= answerCount) return current

      return { ...current, [question.id]: [...currentPicked, choiceId] }
    })
  }

  function toggleFlag() {
    setFlagged((current) => {
      const next = { ...current }
      if (next[question.id]) delete next[question.id]
      else next[question.id] = true
      return next
    })
  }

  function moveTo(nextIndex) {
    setDirection(nextIndex > index ? 'forward' : 'back')
    setIndex(nextIndex)
  }

  function handleSubmitClick() {
    if (incompleteCount > 0) {
      setConfirming(true)
      return
    }
    submit('manual')
  }

  return (
    <div className={styles.layout}>
      <div className={styles.paper}>
        <div className={styles.timerBar}>
          <span className={styles.timerLabel}>남은 시간</span>
          <span className={styles.timer} data-low={isLowTime}>
            {formatTime(remainingSeconds ?? 0)}
          </span>
          {isLowTime ? <span className={styles.timerNote}>1분 미만</span> : null}
        </div>

        <QuestionCard
          index={index}
          total={questions.length}
          domain={question.domain}
          text={question.text}
          bodyKey={question.id}
          direction={direction}
          footer={
            <div className={styles.actions}>
              <button
                className={styles.move}
                type="button"
                aria-label="이전 문제"
                onClick={() => moveTo(index - 1)}
                disabled={index === 0}
              >
                ◀
              </button>
              <button
                className={styles.move}
                type="button"
                aria-label="다음 문제"
                onClick={() => moveTo(index + 1)}
                disabled={index === questions.length - 1}
              >
                ▶
              </button>

              {/* 이동 버튼과 반대쪽 끝에 둔다 — 옆에 붙어 있으면 잘못 눌러 시험이 끝난다 */}
              <button className={styles.submit} type="button" onClick={handleSubmitClick}>
                제출하고 채점하기
              </button>
            </div>
          }
          action={
            <button
              className={styles.flag}
              type="button"
              data-flagged={Boolean(flagged[question.id])}
              aria-pressed={Boolean(flagged[question.id])}
              onClick={toggleFlag}
            >
              {flagged[question.id] ? '표시 해제' : '나중에 다시 보기'}
            </button>
          }
        >
          {answerCount > 1 ? (
            <p className={styles.multiHint}>
              {answerCount}개를 고르세요. 현재 {picked.length}개
            </p>
          ) : null}
          <ChoiceList
            choices={question.choices}
            selectedIds={picked}
            onSelect={selectChoice}
            answerCount={answerCount}
            graded={false}
          />
        </QuestionCard>
      </div>

      {/* 답안지는 문제 카드가 아니라 시험 전체에 딸린 것이라 옆에 세운다.
          65문항이면 화면보다 길어지므로 스스로 스크롤한다 */}
      <div className={styles.sheet}>
        <QuestionNav
          questions={questions}
          answers={answers}
          flagged={flagged}
          currentIndex={index}
          onMove={moveTo}
        />
      </div>

      {/* 네이티브 dialog — 포커스 가둠·Esc 닫기·배경 가림을 브라우저가 맡는다 */}
      <dialog
        className={styles.modal}
        ref={dialogRef}
        onClose={() => setConfirming(false)}
        aria-label="제출 확인"
      >
        <p className={styles.modalText}>
          아직 {incompleteCount}문제가 남아있어요. 제출할까요?
        </p>
        <div className={styles.modalActions}>
          <button
            className={styles.keep}
            type="button"
            onClick={() => setConfirming(false)}
          >
            이어서 풀기
          </button>
          <button className={styles.danger} type="button" onClick={() => submit('manual')}>
            이대로 채점
          </button>
        </div>
      </dialog>
    </div>
  )
}
