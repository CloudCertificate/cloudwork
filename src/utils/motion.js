/*
 * global.css의 prefers-reduced-motion 차단은 CSS가 그리는 것에만 닿는다.
 * JS가 넘기는 값(scrollIntoView의 behavior, 구글 차트의 animation 옵션)은 막지 못하므로 여기서 직접 본다.
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
