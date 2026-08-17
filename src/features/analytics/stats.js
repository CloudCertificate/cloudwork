/*
 * 대시보드 지표. 순수 함수로 둬서 값만 넣고 검증할 수 있게 한다.
 * 합격 예측 모델이 아니다 — 본인 점수 분포만 쓰는 기술 통계다(외부 정답 데이터가 없다).
 */

export function mean(values) {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function standardDeviation(values) {
  if (values.length < 2) return 0
  const average = mean(values)
  const variance =
    values.reduce((sum, value) => sum + (value - average) ** 2, 0) / (values.length - 1)
  return Math.sqrt(variance)
}

export function movingAverage(values, windowSize) {
  return values.map((_, index) => {
    const start = Math.max(0, index - windowSize + 1)
    return mean(values.slice(start, index + 1))
  })
}

/* 최근 N회 중 합격선을 넘은 횟수. */
export function countReached(values, target, recentCount) {
  const recent = values.slice(-recentCount)
  return {
    reached: recent.filter((value) => value >= target).length,
    total: recent.length,
  }
}

// Abramowitz & Stegun 7.1.26 근사. 표준 라이브러리에 erf가 없어서 직접 둔다.
function erf(x) {
  const sign = x < 0 ? -1 : 1
  const absX = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * absX)
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
      t *
      Math.exp(-absX * absX)
  return sign * y
}

/*
 * 지금까지의 점수가 정규분포를 따른다고 가정할 때 다음 회차가 기준선을 넘을 확률.
 * 회차가 2개 미만이거나 편차가 0이면 분포를 말할 수 없으므로 null을 돌려준다.
 */
/*
 * 회차마다 "그 시점까지의 점수로 본 다음 회차 합격 확률"을 계산한다.
 * 분포를 말할 수 없는 구간(1회차, 편차 0)은 null이라 그래프에서 선이 끊긴다.
 */
export function probabilitySeries(values, target) {
  return values.map((_, index) => probabilityOfReaching(values.slice(0, index + 1), target))
}

/* 취약 판정. 유형별 정답률 카드와 자주 표시한 유형 카드가 같은 기준을 써야 한다. */
export const WEAK_CORRECT_RATE = 0.5

export function isWeakDomain(correctRate) {
  return correctRate < WEAK_CORRECT_RATE
}

/*
 * 합격률을 세 등급으로 나눈다. 화면은 등급 이름만 받고 색은 CSS가 고른다.
 * 확률(0~1)이 아니라 화면에 찍히는 정수 퍼센트를 받는다 — 0.404는 40%로 보이는데
 * 확률로 판정하면 경계 바로 위 등급이 나와 표시값과 색이 어긋난다.
 */
export const FORECAST_LOW_MAX_PERCENT = 40
export const FORECAST_MID_MAX_PERCENT = 60

export function forecastLevel(percent) {
  if (percent <= FORECAST_LOW_MAX_PERCENT) return 'low'
  if (percent <= FORECAST_MID_MAX_PERCENT) return 'mid'
  return 'high'
}

export function probabilityOfReaching(values, target) {
  if (values.length < 2) return null

  const deviation = standardDeviation(values)
  if (deviation === 0) return null

  const z = (target - mean(values)) / deviation
  return 1 - 0.5 * (1 + erf(z / Math.SQRT2))
}
