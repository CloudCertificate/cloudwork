import { useMemo } from 'react'
import { Chart } from 'react-google-charts'
import styles from './ScoreChart.module.css'

const CHART_HEIGHT = 320
const PERCENT_MAX = 100

/*
 * 구글 차트는 색을 JS 옵션으로 받는다. 토큰과 갈라지지 않도록 tokens.css의 값을 읽어 넘긴다.
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

export default function ScoreChart({ scores, passProbabilities, passScore, maxScore }) {
  const colors = useMemo(() => readTokenColors(), [])

  const data = [
    ['회차', '점수', '합격선', '다음 회차 합격 확률'],
    ...scores.map((score, index) => [
      `${index + 1}회`,
      score,
      passScore,
      passProbabilities[index] === null
        ? null
        : Math.round(passProbabilities[index] * PERCENT_MAX),
    ]),
  ]

  const options = {
    height: CHART_HEIGHT,
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
      height={`${CHART_HEIGHT}px`}
      data={data}
      options={options}
      loader={<div className={styles.placeholder}>그래프를 불러오는 중입니다.</div>}
    />
  )
}
