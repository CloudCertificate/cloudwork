/* 세션 목록을 최근순 묶음으로 나눈다. now를 인자로 받아 값만 넣고 검증할 수 있게 한다. */

const WEEK_DAYS = 7

function startOfDay(date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function daysBetween(from, to) {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((startOfDay(to) - startOfDay(from)) / msPerDay)
}

function labelFor(elapsedDays) {
  if (elapsedDays <= 0) return '오늘'
  if (elapsedDays === 1) return '어제'
  if (elapsedDays < WEEK_DAYS) return '지난 7일'
  return '이전'
}

export function groupSessionsByRecency(sessions, now) {
  const groups = new Map()

  const sorted = [...sessions].sort(
    (a, b) => new Date(b.startedAt) - new Date(a.startedAt),
  )

  sorted.forEach((session) => {
    const label = labelFor(daysBetween(new Date(session.startedAt), now))
    if (!groups.has(label)) groups.set(label, [])
    groups.get(label).push(session)
  })

  return [...groups].map(([label, items]) => ({ label, sessions: items }))
}
