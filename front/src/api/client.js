/*
 * 서버 통신의 유일한 출입구. 베이스 URL 이 여기 한 곳에만 있다.
 *
 * 실패를 삼키지 않는다 — 상태 코드가 2xx 가 아니면 던지고, 화면이 그 사실을 알게 한다.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function apiGet(path) {
  const response = await fetch(`${BASE_URL}${path}`)

  if (!response.ok) {
    throw new Error(`${path} 요청이 실패했어요 (${response.status})`)
  }

  return response.json()
}
