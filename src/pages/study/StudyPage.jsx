import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useStudyThread } from './useStudyThread.js'
import MessageBubble from './MessageBubble.jsx'
import QuestionBubble from './QuestionBubble.jsx'
import ChatComposer from './ChatComposer.jsx'
import PageLoading from '../../components/PageLoading.jsx'
import { prefersReducedMotion } from '../../utils/motion.js'
import styles from './StudyPage.module.css'

// 바닥에서 이만큼 안쪽이면 새 말풍선이 와도 따라 내려간다.
const STICK_THRESHOLD_PX = 120

export default function StudyPage() {
  const [searchParams] = useSearchParams()
  // domain — 취약 유형 학습(그 도메인 문제만)
  // q — 시험 결과에서 온 복습(그 문제 하나만)
  const thread = useStudyThread({
    certCode: searchParams.get('cert'),
    domain: searchParams.get('domain'),
    reviewIndex: searchParams.get('q'),
  })

  const [draft, setDraft] = useState('')
  const [stickToBottom, setStickToBottom] = useState(true)
  const threadRef = useRef(null)
  const questionRefs = useRef(new Map())

  // 바닥에 붙어 있을 때만 새 말풍선을 따라 내려간다 — 위를 읽는 중이면 끌려가지 않는다
  useEffect(() => {
    if (!stickToBottom || !threadRef.current) return
    threadRef.current.scrollTop = threadRef.current.scrollHeight
  }, [thread.messages, stickToBottom])

  function handleScroll(event) {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget
    setStickToBottom(scrollHeight - scrollTop - clientHeight < STICK_THRESHOLD_PX)
  }

  function scrollToCurrentQuestion() {
    questionRefs.current.get(thread.currentQuestion?.id)?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  function handleSend() {
    const text = draft.trim()
    if (!text) return

    thread.sendMessage(text)
    setDraft('')
  }

  if (thread.questions === null) {
    return <PageLoading>문제를 불러오는 중입니다.</PageLoading>
  }

  const lastMessage = thread.messages[thread.messages.length - 1]

  return (
    <div className={styles.page}>
      {/* 스크롤은 전체 폭에서 하고 내용만 가운데로 모은다 — 스크롤바가 화면 오른쪽 끝에 붙는다 */}
      <div className={styles.thread} ref={threadRef} onScroll={handleScroll}>
        <ol className={styles.threadInner}>
          {thread.messages.map((message) =>
            message.kind === 'question' ? (
              <MessageBubble key={message.id} role="ai">
                <div
                  ref={(element) => {
                    if (element) questionRefs.current.set(message.id, element)
                    else questionRefs.current.delete(message.id)
                  }}
                >
                  <QuestionBubble
                    question={thread.questions[message.questionIndex]}
                    order={message.order}
                    selectedIds={message.selectedIds}
                    firstAnswerIds={message.firstAnswerIds}
                    locked={message.locked}
                    onSelect={(choiceId) => thread.selectChoice(message, choiceId)}
                    onSubmit={() => thread.submitAnswer(message)}
                  />
                </div>
              </MessageBubble>
            ) : (
              <MessageBubble key={message.id} role={message.role}>
                {message.text}
                {/* 버튼은 가장 최근 말풍선에만 살린다 — 위로 올라간 옛 버튼을 누르면 흐름이 꼬인다 */}
                {message.id === lastMessage?.id &&
                message.role === 'ai' &&
                thread.answered ? (
                  <ThreadActions thread={thread} />
                ) : null}
              </MessageBubble>
            ),
          )}

          {thread.waiting ? (
            <li className={styles.waiting}>
              <span className={styles.waitingLabel}>생각 중이에요</span>
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
            ↓ 아래로
          </button>
        )}
        <ChatComposer
          draft={draft}
          onDraftChange={setDraft}
          onSend={handleSend}
          waiting={thread.waiting}
        />
      </div>
    </div>
  )
}

/* 흐름 제어는 앱이 한다 — AI는 권하기만 하고 실제 출제는 이 버튼이 한다(CLAUDE.md §4 ①). */
function ThreadActions({ thread }) {
  return (
    <div className={styles.actions}>
      {thread.currentQuestion.locked ? (
        <button className={styles.secondary} type="button" onClick={thread.retryCurrent}>
          다시 골라보기
        </button>
      ) : null}
      {thread.hasMore && !thread.reachedLimit ? (
        <button className={styles.primary} type="button" onClick={thread.askNextQuestion}>
          다음 문제
        </button>
      ) : (
        <Link className={styles.primary} to="/">
          학습 마치기
        </Link>
      )}
    </div>
  )
}
