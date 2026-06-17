// IncomeChart — Highcharts combo over a fixed 12-month axis:
//   • column  当月收益 (per-point 涨红跌绿)
//   • line    累计收益 (gold)
//   • line    银行定存 1.4% (gray)
//   • arearange 目标 3.3%–5% 走廊 (blue band, beneath everything)
// The target band reuses computeSeries() with bankRate 0.033 / 0.05 — no separate math.

import Highcharts from 'highcharts'
import HighchartsMore from 'highcharts/highcharts-more'
import HighchartsReact from 'highcharts-react-official'
import { useMemo } from 'react'
import { computeSeries, type Row } from '../compute'
import type { MonthRow } from '../data/types'
import { COLORS } from '../theme'

// arearange lives in the highcharts-more module — register it once.
;(HighchartsMore as unknown as (hc: typeof Highcharts) => void)(Highcharts)

const FULL_MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))

const byMonth = (rows: Row[]) => Object.fromEntries(rows.map((r) => [r.month, r]))

interface Props {
  months: MonthRow[]
}

export function IncomeChart({ months }: Props) {
  const options = useMemo<Highcharts.Options>(() => {
    const rows = byMonth(computeSeries(months).rows)
    const low = byMonth(computeSeries(months, 0.033).rows)
    const high = byMonth(computeSeries(months, 0.05).rows)

    const col = (key: keyof Row) =>
      FULL_MONTHS.map((m) => (rows[m] ? (rows[m][key] as number) : null))

    const bandData = FULL_MONTHS.map((m) =>
      low[m] && high[m] ? [low[m].cumBankInterest, high[m].cumBankInterest] : null,
    )

    const barData = FULL_MONTHS.map((m) => {
      const r = rows[m]
      if (!r) return null
      return { y: r.investIncome, color: r.investIncome >= 0 ? COLORS.upBar : COLORS.downBar }
    })

    // 银行定存线：只在最后一个有数据的点标注金额（灰字）。
    const bankData = col('cumBankInterest')
    const lastBankIdx = bankData.reduce<number>((acc, v, i) => (v != null ? i : acc), -1)

    return {
      chart: { type: 'line', backgroundColor: 'transparent', spacing: [12, 4, 0, 0] },
      title: { text: undefined },
      credits: { enabled: false },
      legend: { enabled: false }, // custom legend rendered in markup
      xAxis: {
        categories: FULL_MONTHS.map((m) => parseInt(m, 10) + '月'),
        lineColor: '#f0f2f5',
        tickWidth: 0,
        labels: { style: { color: '#9aa0a8', fontSize: '12px' } },
      },
      yAxis: {
        title: { text: undefined },
        gridLineColor: '#f0f2f5',
        labels: {
          formatter() {
            return '¥' + this.value
          },
          style: { color: '#aab0b8', fontSize: '11px' },
        },
      },
      plotOptions: {
        series: {
          enableMouseTracking: false, // 禁用 hover / tooltip 交互
        },
        column: { borderRadius: 4, pointPadding: 0.18, groupPadding: 0.22 },
        line: { lineWidth: 2 },
      },
      series: [
        {
          type: 'arearange',
          name: '年利化 3.3%–5%',
          // null entries render as gaps at runtime; HC's static type omits null here.
          data: bandData as unknown as Highcharts.SeriesArearangeOptions['data'],
          color: COLORS.band,
          fillColor: COLORS.band,
          lineWidth: 0,
          zIndex: 0,
          enableMouseTracking: false,
          marker: { enabled: false },
        },
        {
          type: 'column',
          name: '当月收益',
          data: barData,
          zIndex: 1,
        },
        {
          type: 'line',
          name: '累计收益',
          data: col('cumIncome'),
          color: COLORS.gold,
          zIndex: 3,
          marker: { enabled: true, radius: 3 },
          dataLabels: {
            enabled: true,
            formatter() {
              const v = this.y as number
              return (v < 0 ? '−' : '') + '¥' + Math.round(Math.abs(v)).toLocaleString('zh-CN')
            },
            style: {
              color: COLORS.gold,
              fontSize: '11px',
              fontWeight: '500',
              textOutline: '3px #fff', // 白色描边，提升在折线/柱子上的可读性
            },
            y: -6,
          },
        },
        {
          type: 'line',
          name: '银行定存 1.4%',
          data: bankData,
          color: COLORS.bankGray,
          zIndex: 2,
          marker: { enabled: true, radius: 3 },
          dataLabels: {
            enabled: true,
            formatter() {
              if (this.point.index !== lastBankIdx) return undefined
              return '¥' + Math.round(this.y as number).toLocaleString('zh-CN')
            },
            verticalAlign: 'top',
            y: 14,
            style: {
              color: COLORS.muted,
              fontSize: '11px',
              fontWeight: '500',
              textOutline: '3px #fff',
            },
          },
        },
      ],
    }
  }, [months])

  return (
    <section className="card reveal" style={{ animationDelay: '.2s' }}>
      <h2>累计收益走势</h2>
      <div className="legend">
        <span className="lg">
          <span className="mk line" style={{ background: COLORS.gold }} />
          累计收益
        </span>
        <span className="lg">
          <span className="mk line" style={{ background: COLORS.bankGray }} />
          银行定存 1.4%
        </span>
        <span className="lg">
          <span className="mk band" />
          年利化 3.3%–5%
        </span>
        <span className="lg">
          <span className="mk bar" />
          当月收益
        </span>
      </div>
      <div className="chart-box">
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
          containerProps={{ style: { height: '100%', width: '100%' } }}
        />
      </div>
    </section>
  )
}
