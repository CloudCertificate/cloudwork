import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchQuestions } from '../../api/quiz.js'
import { askTutor, buildGradeReply } from '../../api/tutor.js'
import { isAnswerCorrect } from '../../features/exam/score.js'

// 한 세션이 무한정 길어지지 않도록 이쯤에서 마무리를 제안한다.
const SESSION_QUESTION_LIMIT = 20

/*
 * 학습 화면의 대화 한 벌을 소유한다 — 문제 적재, 말풍선 목록, 채점, 튜터 응답.
 * 화면에서 떼어 둔 이유는 둘이다: 페이지가 렌더만 하게 되고, 흐름 규칙(한 문제는 한 번만 답한다·
 * 다음 문제는 앱이 낸다)이 한 파일에 모인다.
 *
 * 채점은 여기서 `correct` 필드로 판정하고 AI에게는 결과를 사실로 넘긴다(docs/product.md §2 ②).
 */
export function useStudyChat({ examId, domain, reviewIndex, sessionId }) {
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
          selectedMarkers: [],
          graded: false,
        },
      ])
    },
    [nextId],
  )

  /*
   * 진입 조건이 바뀌면 새 세션이다. sessionId가 여기 들어 있는 이유는 사이드바에서 다른 세션을
   * 눌렀을 때 앞 대화가 남아 있으면 안 되기 때문이다 —
   * 지난 대화를 실제로 불러오는 건 서버가 붙은 뒤다(지금은 어느 세션이든 새로 시작한다).
   */
  useEffect(() => {
    const sessionKey = `${examId}|${domain}|${reviewIndex}|${sessionId}`
    if (startedFor.current === sessionKey) return
    startedFor.current = sessionKey
    setMessages([])

    fetchQuestions(examId, { domain }).then((loaded) => {
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
  }, [examId, domain, reviewIndex, sessionId, appendText, appendQuestion])

  const questionMessages = messages.filter((message) => message.kind === 'question')
  const currentQuestion = questionMessages[questionMessages.length - 1] ?? null
  const askedCount = questionMessages.length

  function gradeAnswer(message, pickedMarkers) {
    const question = questions[message.questionIndex]
    const correct = isAnswerCorrect(question, pickedMarkers)

    const label = (marker) => marker.toUpperCase()
    const correctChoices = question.choices.filter((c) => c.correct)
    // 고른 것 중 틀린 것만 — 복수 정답에서 하나만 맞힌 경우 맞힌 보기는 여기 들어오면 안 된다
    const wrongChoices = question.choices.filter(
      (c) => pickedMarkers.includes(c.marker) && !c.correct,
    )

    setMessages((current) =>
      current.map((item) =>
        item.id === message.id
          ? { ...item, selectedMarkers: pickedMarkers, graded: true }
          : item,
      ),
    )

    appendText('user', pickedMarkers.map(label).join(', '))
    appendText(
      'ai',
      buildGradeReply({
        correct,
        correctMarkers: correctChoices.map((c) => label(c.marker)).join(', '),
        correctChoices,
        wrongMarkers: wrongChoices.map((c) => label(c.marker)).join(', '),
        wrongChoices,
      }),
    )

    /*
     * 채점 뒤에 다음을 재촉하지 않는다 — 해설을 읽는 중에 넘어가라는 말이 붙으면 방해가 된다.
     * 넘어가고 싶으면 입력창 옆 버튼을 누른다(docs/product.md §2 ①).
     * 세션 한도는 예외다. 여기서 끊지 않으면 세션 하나가 무한정 길어진다.
     */
    if (askedCount >= SESSION_QUESTION_LIMIT) {
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
    const picked = message.selectedMarkers

    let nextPicked
    if (answerCount === 1) nextPicked = [choiceId]
    else if (picked.includes(choiceId)) nextPicked = picked.filter((id) => id !== choiceId)
    else if (picked.length >= answerCount) nextPicked = picked
    else nextPicked = [...picked, choiceId]

    setMessages((current) =>
      current.map((item) =>
        item.id === message.id ? { ...item, selectedMarkers: nextPicked } : item,
      ),
    )

    if (answerCount === 1) gradeAnswer(message, nextPicked)
  }

  function submitAnswer(message) {
    gradeAnswer(message, message.selectedMarkers)
  }

  function askNextQuestion() {
    appendQuestion(currentQuestion.questionIndex + 1, askedCount + 1)
  }

  function sendMessage(text) {
    const history = [...messages, { role: 'user', text }]
    setMessages((current) => [
      ...current,
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
    answered: Boolean(currentQuestion) && currentQuestion.graded,
    hasMore: Boolean(
      currentQuestion && currentQuestion.questionIndex + 1 < (questions?.length ?? 0),
    ),
    reachedLimit: askedCount >= SESSION_QUESTION_LIMIT,
    selectChoice,
    submitAnswer,
    askNextQuestion,
    sendMessage,
  }
}
