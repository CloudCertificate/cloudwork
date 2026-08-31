import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useStudyChat } from './useStudyChat.js'
import MessageBubble from './MessageBubble.jsx'
import QuestionContents from './QuestionContents.jsx'
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
  // session — 사이드바에서 연 지난 학습
  const chat = useStudyChat({
    examId: searchParams.get('exam'),
    domain: searchParams.get('domain'),
    reviewIndex: searchParams.get('q'),
    sessionId: searchParams.get('session'),
  })

  const [draft, setDraft] = useState('')
  const [stickToBottom, setStickToBottom] = useState(true)
  const chatRef = useRef(null)
  const questionRefs = useRef(new Map())

  // 바닥에 붙어 있을 때만 새 말풍선을 따라 내려간다 — 위를 읽는 중이면 끌려가지 않는다
  useEffect(() => {
    if (!stickToBottom || !chatRef.current) return
    chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [chat.messages, stickToBottom])

  function handleScroll(event) {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget
    setStickToBottom(scrollHeight - scrollTop - clientHeight < STICK_THRESHOLD_PX)
  }

  function scrollToCurrentQuestion() {
    questionRefs.current.get(chat.currentQuestion?.id)?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  function handleSend() {
    const text = draft.trim()
    if (!text) return

    chat.sendMessage(text)
    setDraft('')
  }

  if (chat.questions === null) {
    return <PageLoading>문제를 불러오는 중이에요.</PageLoading>
  }

  return (
    <div className={styles.page}>
      {/* 스크롤은 전체 폭에서 하고 내용만 가운데로 모은다 — 스크롤바가 화면 오른쪽 끝에 붙는다 */}
      <div className={styles.chat} ref={chatRef} onScroll={handleScroll}>
        <ol className={styles.chatInner}>
          {chat.messages.map((message) =>
            message.kind === 'question' ? (
              <MessageBubble key={message.id} role="ai">
                <div
                  ref={(element) => {
                    if (element) questionRefs.current.set(message.id, element)
                    else questionRefs.current.delete(message.id)
                  }}
                >
                  <QuestionContents
                    question={chat.questions[message.questionIndex]}
                    order={message.order}
                    selectedMarkers={message.selectedMarkers}
                    graded={message.graded}
                    onSelect={(choiceId) => chat.selectChoice(message, choiceId)}
                    onSubmit={() => chat.submitAnswer(message)}
                  />
                </div>
              </MessageBubble>
            ) : (
              <MessageBubble key={message.id} role={message.role}>
                {message.text}
              </MessageBubble>
            ),
          )}

          {chat.waiting ? (
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
          waiting={chat.waiting}
          actions={chat.answered ? <ChatActions chat={chat} /> : null}
        />
      </div>
    </div>
  )
}

/* 출제는 AI가 아니라 이 버튼이 한다(docs/product.md §2 ①). 채점된 뒤에만 선다. */
function ChatActions({ chat }) {
  return chat.hasMore && !chat.reachedLimit ? (
    <button className={styles.action} type="button" onClick={chat.askNextQuestion}>
      다음 문제
    </button>
  ) : (
    <Link className={styles.action} to="/">
      학습 마치기
    </Link>
  )
}
