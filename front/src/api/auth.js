/*
 * 인증. 서버가 생기기 전까지 성공만 흉내 낸다.
 * 실제로는 구글 OAuth로 넘어갔다가 돌아오고, 세션은 서버가 쿠키로 들고 있는다.
 */

const SIGN_IN_DELAY_MS = 600

export function signInWithGoogle() {
  return new Promise((resolve) => {
    setTimeout(resolve, SIGN_IN_DELAY_MS)
  })
}

export function signOut() {
  return Promise.resolve()
}
