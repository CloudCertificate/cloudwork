/*
 * 현재 사용자. 서버가 생기기 전까지 하드코딩한다.
 * 로그인해야 쓸 수 있는 서비스라 게스트 상태는 없다(docs/product.md §2 인증).
 */

const CURRENT_USER = {
  name: '홍길동',
}

export function fetchCurrentUser() {
  return Promise.resolve(CURRENT_USER)
}
