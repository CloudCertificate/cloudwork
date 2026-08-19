import { useMemo, useState } from 'react'
import { Chart } from 'react-google-charts'
import { prefersReducedMotion } from '../../utils/motion.js'
import styles from './ScoreChart.module.css'

const PERCENT_MAX = 100
/* 구글 차트는 CSS 밖에서 그려서 --motion-* 토큰이 닿지 않는다. 여기 숫자가 그 자리를 대신한다 */
const ANIMATION_MS = 600

/*
 * 구글 차트는 색과 높이를 JS 옵션으로 받는다. 토큰과 갈라지지 않도록 tokens.css의 값을 읽어 넘긴다.
 * (읽기 전용이라 CSS가 여전히 단일 소스다)
 */
function readTokenColors() {
  const style = getComputedStyle(document.documentElement)
  const read = (name) => style.getPropertyValue(name).trim()

  return {
    accent: read('--color-accent'),
    correct: read('--color-correct'),
    muted: read('--color-text-muted'),
    border: read('--color-border'),
  }
}

/* 높이가 자리표시자 CSS와 갈라지면 그래프가 뜨는 순간 화면이 튄다 */
function readChartHeight() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(
    '--layout-chart-height',
  )
  return Number.parseInt(raw, 10)
}

export default function ScoreChart({ scores, passProbabilities, passScore, maxScore }) {
  const colors = useMemo(() => readTokenColors(), [])
  const chartHeight = useMemo(() => readChartHeight(), [])

  /*
   * animation.startup은 이 버전(react-google-charts 5 + charts v51)에서 차트를 통째로 죽인다
   * ("Cannot read properties of undefined"). 대신 데이터가 바뀔 때 걸리는 전환을 쓴다 —
   * 평평한 값으로 한 번 그린 뒤 실제 값으로 바꾸면 선이 바닥에서 자라 올라온다.
   *
   * 바꾸는 시점은 차트의 ready 이벤트다. 마운트 직후(requestAnimationFrame)에 바꾸면
   * gstatic 스크립트가 아직 안 와서 첫 그리기 자체가 실제 값으로 일어나고 전환이 사라진다.
   */
  const [grown, setGrown] = useState(false)

  const rows = scores.map((score, index) => [
    `${index + 1}회`,
    score,
    passScore,
    passProbabilities[index] === null
      ? null
      : Math.round(passProbabilities[index] * PERCENT_MAX),
  ])

  // 확률이 null인 구간은 0으로 바꾸지 않는다 — 없는 값이라 선이 끊겨 있어야 한다
  const flatRows = rows.map(([label, , , probability]) => [
    label,
    0,
    0,
    probability === null ? null : 0,
  ])

  const data = [
    ['회차', '점수', '합격선', '다음 회차 합격 확률'],
    ...(grown ? rows : flatRows),
  ]

  const options = {
    /*
     * animation.startup은 이 버전에서 차트를 죽인다(위 주석). duration만 두면 데이터가 바뀔 때 전환된다.
     * viewWindow로 축을 고정해 둔 덕에 자라 오르는 동안 눈금이 흔들리지 않는다 —
     * 범위를 자동에 맡기면 그리는 내내 축이 같이 움직여 선이 어디로 가는지 안 보인다.
     */
    animation: {
      duration: prefersReducedMotion() ? 0 : ANIMATION_MS,
      easing: 'out',
    },
    height: chartHeight,
    chartArea: { left: 64, right: 64, top: 24, bottom: 56 },
    legend: { position: 'bottom', textStyle: { color: colors.muted } },
    backgroundColor: 'transparent',
    focusTarget: 'category',
    hAxis: { textStyle: { color: colors.muted }, baselineColor: colors.border },
    vAxes: {
      0: {
        viewWindow: { min: 0, max: maxScore },
        textStyle: { color: colors.muted },
        gridlines: { color: colors.border },
        baselineColor: colors.border,
      },
      1: {
        viewWindow: { min: 0, max: PERCENT_MAX },
        format: "#'%'",
        textStyle: { color: colors.muted },
        gridlines: { count: 0 },
        baselineColor: 'transparent',
      },
    },
    series: {
      0: { targetAxisIndex: 0, color: colors.accent, lineWidth: 3, pointSize: 6 },
      1: {
        targetAxisIndex: 0,
        color: colors.correct,
        lineWidth: 1,
        lineDashStyle: [4, 4],
        pointSize: 0,
        enableInteractivity: false,
      },
      2: { targetAxisIndex: 1, color: colors.muted, lineWidth: 2, pointSize: 4 },
    },
  }

  return (
    <Chart
      chartType="LineChart"
      width="100%"
      height={`${chartHeight}px`}
      data={data}
      options={options}
      chartEvents={[{ eventName: 'ready', callback: () => setGrown(true) }]}
      loader={<div className={styles.placeholder}>그래프를 불러오는 중이에요.</div>}
    />
  )
}
