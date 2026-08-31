/*
 * 유형(도메인) 4개 표. 백엔드가 원본이고 이건 사본이다(docs/backend-contract.md §1).
 * 바뀌면 back/domain/constants.py 와 같은 커밋에서 둘 다 고친다.
 *
 * API 로 내려받지 않는 이유: 대시보드 첫 렌더가 그래프 축 라벨을 기다리게 된다.
 *
 * 서버가 문제에 붙여 주는 값은 code('1'~'4') 다. 이름은 여기서 찾는다 —
 * 공식 명칭은 전부 '~ 아키텍처 설계'로 끝나 그래프 축에서 잘리므로 label 을 따로 둔다.
 */

export const DOMAINS = [
  { code: '1', name: '보안 아키텍처 설계', label: '보안', weight: 30 },
  { code: '2', name: '복원력을 갖춘 아키텍처 설계', label: '복원력', weight: 26 },
  { code: '3', name: '고성능 아키텍처 설계', label: '고성능', weight: 24 },
  { code: '4', name: '비용에 최적화된 아키텍처 설계', label: '비용 최적화', weight: 20 },
]

/* 모르는 코드는 감추지 않고 그대로 보여준다 — 사본이 어긋났다는 신호다. */
export function domainLabel(code) {
  return DOMAINS.find((domain) => domain.code === code)?.label ?? code
}
