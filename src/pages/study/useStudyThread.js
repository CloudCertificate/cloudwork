import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchQuestions } from '../../api/quiz.js'
import { askTutor, buildGradeReply } from '../../api/tutor.js'
import { isAnswerCorrect } from '../../features/exam/score.js'
import { MARKERS } from '../../components/ChoiceList.jsx'

// 한 세션이 무한정 길어지지 않도록 이쯤에서 마무리를 제안한다.
const SESSION_QUESTION_LIMIT = 20

/*
 * 학습 화면의 대화 한 벌을 소유한다 — 문제 적재, 말풍선 목록, 채점, 튜터 응답.
 * 화면에서 떼어 둔 이유는 둘이다: 페이지가 렌더만 하게 되고, 흐름 규칙(첫 답만 기록·
 * 버튼은 앱이 제어)이 한 파일에 모인다.
 *
 * 채점은 여기서 `correct` 필드로 판정하고 AI에게는 결과를 사실로 넘긴다(CLAUDE.md §4 ②).
 */
export function useStudyThread({ certCode, domain, reviewIndex }) {
  const [questions, setQuestions] = useState(null)
  const [messages, setMessages] = useState([])
  const [waiting, setWaiting] = useState(false)

  const messageId = useRef(0)
  // 첫 문제를 한 번만 출제한다. StrictMode는 개발 모드에서 effect를 두 번 돌린다.
  const startedFor = useRef(null)

  const nextId = useCallback(() => {
    messageId.current += 1
    return messageId.current
  }, [])

  const appendText = useCallback(
    (role, text, extra = {}) => {
      setMessages((current) => [
        ...current,
        { id: nextId(), role, kind: 'text', text, ...extra },
      ])
    },
    [nextId],
  )

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

  // 진입 조건이 바뀌면 새 세션이다
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
  }, [certCode, domain, reviewIndex, appendText, appendQuestion])

  const questionMessages = messages.filter((message) => message.kind === 'question')
  const currentQuestion = questionMessages[questionMessages.length - 1] ?? null
  const askedCount = questionMessages.length

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
              // 첫 답은 덮어쓰지 않는다 — 재시도로 맞힌 걸 정답으로 세면 취약 유형 판정이 오염된다
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

  /* 단일 정답은 고르는 즉시 채점하고, 복수 정답은 개수를 채운 뒤 제출 버튼으로 채점한다. */
  function selectChoice(message, choiceId) {
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

  function submitAnswer(message) {
    gradeAnswer(message, message.selectedIds)
  }

  function retryCurrent() {
    setMessages((current) =>
      current.map((item) =>
        item.id === currentQuestion.id ? { ...item, locked: false } : item,
      ),
    )
    appendText('ai', '다시 골라 보세요. 기록에는 첫 답만 남아요.', { retryPrompt: true })
  }

  function askNextQuestion() {
    appendQuestion(currentQuestion.questionIndex + 1, askedCount + 1)
  }

  /* 재선택 안내에 답 대신 채팅을 하면 안 고르겠다는 뜻이다 — 안내를 걷고 보기를 다시 잠근다. */
  function cancelRetryPrompt(current) {
    if (!current.some((item) => item.retryPrompt)) return current

    return current
      .filter((item) => !item.retryPrompt)
      .map((item) => (item.id === currentQuestion?.id ? { ...item, locked: true } : item))
  }

  function sendMessage(text) {
    const history = [...messages, { role: 'user', text }]
    setMessages((current) => [
      ...cancelRetryPrompt(current),
      { id: nextId(), role: 'user', kind: 'text', text },
    ])
    setWaiting(true)

    askTutor({ history }).then((reply) => {
      appendText('ai', reply)
      setWaiting(false)
    })
  }

  return {
    questions,
    messages,
    waiting,
    currentQuestion,
    answered: Boolean(currentQuestion) && currentQuestion.firstAnswerIds !== null,
    hasMore: Boolean(
      currentQuestion && currentQuestion.questionIndex + 1 < (questions?.length ?? 0),
    ),
    reachedLimit: askedCount >= SESSION_QUESTION_LIMIT,
    selectChoice,
    submitAnswer,
    retryCurrent,
    askNextQuestion,
    sendMessage,
  }
}
