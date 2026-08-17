import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchQuestions } from '../api/quiz.js'
import { askTutor, buildGradeReply } from '../api/tutor.js'
import { isAnswerCorrect } from '../features/exam/score.js'
import { MARKERS } from '../components/ChoiceList.jsx'
import MessageBubble from '../components/MessageBubble.jsx'
import QuestionBubble from '../components/QuestionBubble.jsx'
import ChatComposer from '../components/ChatComposer.jsx'
import styles from './StudyPage.module.css'

// 한 세션이 무한정 길어지지 않도록 이쯤에서 마무리를 제안한다.
const SESSION_QUESTION_LIMIT = 20
// 바닥에서 이만큼 안쪽이면 새 말풍선이 와도 따라 내려간다.
const STICK_THRESHOLD_PX = 120

export default function StudyPage() {
  const [searchParams] = useSearchParams()
  const certCode = searchParams.get('cert')
  // domain — 취약 유형 학습(그 도메인 문제만)
  // q — 시험 결과에서 온 복습(그 문제 하나만)
  const domain = searchParams.get('domain')
  const reviewIndex = searchParams.get('q')

  const [questions, setQuestions] = useState(null)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [waiting, setWaiting] = useState(false)
  const [stickToBottom, setStickToBottom] = useState(true)

  const threadRef = useRef(null)
  const questionRefs = useRef(new Map())
  const messageId = useRef(0)
  // 첫 문제를 한 번만 출제한다. StrictMode는 개발 모드에서 effect를 두 번 돌린다.
  const startedFor = useRef(null)

  const nextId = useCallback(() => {
    messageId.current += 1
    return messageId.current
  }, [])

  const appendQuestion = useCallback(
    (questionIndex, order) => {
      setMessages((current) => [
        ...current,
        {
          id: nextId(),
          role: 'ai',
          kind: 'question',
          questionIndex,
          order,
          selectedIds: [],
          firstAnswerIds: null,
          locked: false,
        },
      ])
    },
    [nextId],
  )

  useEffect(() => {
    const sessionKey = `${certCode}|${domain}|${reviewIndex}`
    if (startedFor.current === sessionKey) return
    startedFor.current = sessionKey
    setMessages([])

    fetchQuestions(certCode, { domain }).then((loaded) => {
      const requested = Number.parseInt(reviewIndex ?? '', 10)
      const isReview =
        Number.isInteger(requested) && requested >= 0 && requested < loaded.length

      // 복습은 그 문제 하나만 담은 대화다 — 다음 문제로 이어지지 않는다
      const pool = isReview ? [loaded[requested]] : loaded
      setQuestions(pool)

      if (isReview) {
        appendText('ai', '모의고사에서 봤던 문제예요. 다시 한번 풀어 볼까요?')
      } else if (domain) {
        appendText('ai', `${domain} 문제만 골라드릴게요.`)
      }

      if (pool.length === 0) {
        appendText('ai', '아직 이 조건에 맞는 문제가 없어요. 다른 유형을 골라 보세요.')
      } else {
        appendQuestion(0, 1)
      }
    })
    // 진입 조건이 바뀌면 새 세션이다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certCode, domain, reviewIndex])

  useEffect(() => {
    if (!stickToBottom || !threadRef.current) return
    threadRef.current.scrollTop = threadRef.current.scrollHeight
  }, [messages, stickToBottom])

  function handleScroll(event) {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget
    setStickToBottom(scrollHeight - scrollTop - clientHeight < STICK_THRESHOLD_PX)
  }

  const questionMessages = messages.filter((message) => message.kind === 'question')
  const currentQuestion = questionMessages[questionMessages.length - 1] ?? null
  const askedCount = questionMessages.length

  function appendText(role, text, extra = {}) {
    setMessages((current) => [
      ...current,
      { id: nextId(), role, kind: 'text', text, ...extra },
    ])
  }

  /* 단일 정답은 고르는 즉시 채점하고, 복수 정답은 개수를 채운 뒤 제출 버튼으로 채점한다. */
  function handleSelect(message, choiceId) {
    const question = questions[message.questionIndex]
    const answerCount = question.answerCount ?? 1
    const picked = message.selectedIds

    let nextPicked
    if (answerCount === 1) nextPicked = [choiceId]
    else if (picked.includes(choiceId)) nextPicked = picked.filter((id) => id !== choiceId)
    else if (picked.length >= answerCount) nextPicked = picked
    else nextPicked = [...picked, choiceId]

    setMessages((current) =>
      current.map((item) =>
        item.id === message.id ? { ...item, selectedIds: nextPicked } : item,
      ),
    )

    if (answerCount === 1) gradeAnswer(message, nextPicked)
  }

  function gradeAnswer(message, pickedIds) {
    const question = questions[message.questionIndex]
    const retry = message.firstAnswerIds !== null
    const correct = isAnswerCorrect(question, pickedIds)

    const markerOf = (id) => MARKERS[question.choices.findIndex((c) => c.id === id)]
    const correctIds = question.choices.filter((c) => c.correct).map((c) => c.id)

    setMessages((current) =>
      current.map((item) =>
        item.id === message.id
          ? {
              ...item,
              selectedIds: pickedIds,
              firstAnswerIds: retry ? item.firstAnswerIds : pickedIds,
              locked: true,
            }
          : item,
      ),
    )

    appendText('user', pickedIds.map((id) => markerOf(id)).join(', '))
    appendText(
      'ai',
      buildGradeReply({
        correct,
        correctMarkers: correctIds.map(markerOf).join(', '),
        correctChoices: question.choices.filter((c) => c.correct),
        pickedChoices: question.choices.filter((c) => pickedIds.includes(c.id)),
        retry,
      }),
    )

    if (!retry && askedCount >= SESSION_QUESTION_LIMIT) {
      appendText(
        'ai',
        `오늘 ${SESSION_QUESTION_LIMIT}문제나 푸셨어요. 여기서 마무리할까요?`,
      )
    }
  }

  function handleRetry() {
    setMessages((current) =>
      current.map((item) =>
        item.id === currentQuestion.id ? { ...item, locked: false } : item,
      ),
    )
    appendText('ai', '다시 골라 보세요. 기록에는 첫 답만 남아요.', { retryPrompt: true })
  }

  /* 재선택 안내에 답 대신 채팅을 하면 안 고르겠다는 뜻이다 — 안내를 걷고 보기를 다시 잠근다. */
  function cancelRetryPrompt(current) {
    if (!current.some((item) => item.retryPrompt)) return current

    return current
      .filter((item) => !item.retryPrompt)
      .map((item) => (item.id === currentQuestion?.id ? { ...item, locked: true } : item))
  }

  function handleNext() {
    appendQuestion(currentQuestion.questionIndex + 1, askedCount + 1)
  }

  function handleSend() {
    const text = draft.trim()
    if (!text) return

    const history = [...messages, { role: 'user', text }]
    setMessages((current) => [
      ...cancelRetryPrompt(current),
      { id: nextId(), role: 'user', kind: 'text', text },
    ])
    setDraft('')
    setWaiting(true)

    askTutor({ history }).then((reply) => {
      appendText('ai', reply)
      setWaiting(false)
    })
  }

  function scrollToCurrentQuestion() {
    questionRefs.current
      .get(currentQuestion?.id)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (questions === null) {
    return <p className={styles.loading}>문제를 불러오는 중입니다.</p>
  }

  const answered = Boolean(currentQuestion) && currentQuestion.firstAnswerIds !== null
  const hasMore = currentQuestion && currentQuestion.questionIndex + 1 < questions.length
  const reachedLimit = askedCount >= SESSION_QUESTION_LIMIT
  const lastMessage = messages[messages.length - 1]

  return (
    <div className={styles.page}>
      {/* 스크롤은 전체 폭에서 하고 내용만 가운데로 모은다 — 스크롤바가 화면 오른쪽 끝에 붙는다 */}
      <div className={styles.thread} ref={threadRef} onScroll={handleScroll}>
        <ol className={styles.threadInner}>
          {messages.map((message) => {
          const isLast = message.id === lastMessage?.id

          if (message.kind === 'question') {
            return (
              <MessageBubble key={message.id} role="ai">
                <div
                  ref={(element) => {
                    if (element) questionRefs.current.set(message.id, element)
                    else questionRefs.current.delete(message.id)
                  }}
                >
                  <QuestionBubble
                    question={questions[message.questionIndex]}
                    order={message.order}
                    selectedIds={message.selectedIds}
                    firstAnswerIds={message.firstAnswerIds}
                    locked={message.locked}
                    onSelect={(choiceId) => handleSelect(message, choiceId)}
                    onSubmit={() => gradeAnswer(message, message.selectedIds)}
                  />
                </div>
              </MessageBubble>
            )
          }

          return (
            <MessageBubble key={message.id} role={message.role}>
              {message.text}
              {/* 버튼은 가장 최근 말풍선에만 살린다 — 위로 올라간 옛 버튼을 누르면 흐름이 꼬인다 */}
              {isLast && message.role === 'ai' && answered ? (
                <div className={styles.actions}>
                  {currentQuestion.locked ? (
                    <button className={styles.secondary} type="button" onClick={handleRetry}>
                      다시 골라보기
                    </button>
                  ) : null}
                  {hasMore && !reachedLimit ? (
                    <button className={styles.primary} type="button" onClick={handleNext}>
                      다음 문제
                    </button>
                  ) : (
                    <Link className={styles.primary} to="/">
                      학습 마치기
                    </Link>
                  )}
                </div>
              ) : null}
            </MessageBubble>
          )
          })}

          {waiting ? (
            <li className={styles.waiting}>
              <span className={styles.waitingLabel}>답을 쓰는 중이에요</span>
              <span className={styles.dots} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </li>
          ) : null}
        </ol>
      </div>

      <div className={styles.composerRow}>
        {stickToBottom ? null : (
          <button className={styles.jump} type="button" onClick={scrollToCurrentQuestion}>
            ↓ 현재 문제로
          </button>
        )}
        <ChatComposer
          draft={draft}
          onDraftChange={setDraft}
          onSend={handleSend}
          waiting={waiting}
        />
      </div>
    </div>
  )
}
