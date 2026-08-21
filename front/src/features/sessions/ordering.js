/* 세션 목록은 최근에 시작한 것이 위로 온다. 값만 넣고 검증할 수 있게 순수 함수로 둔다. */

export function sortSessionsByRecent(sessions) {
  return [...sessions].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
}
