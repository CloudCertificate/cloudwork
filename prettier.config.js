/*
 * 기존 코드 스타일을 그대로 굳힌다 — 도입하면서 전 파일이 흔들리면 diff가 읽히지 않는다.
 * printWidth 92는 임의값이 아니라 현재 소스와 가장 적게 부딪히는 값이다(88/90/95/100보다 재포맷이 적다).
 * endOfLine auto — 저장소에 CRLF 파일이 3개 섞여 있어 lf로 고정하면 그 파일이 통째로 바뀐다.
 */
export default {
  semi: false,
  singleQuote: true,
  printWidth: 92,
  endOfLine: 'auto',
}
