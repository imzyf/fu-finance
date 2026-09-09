// SavingsChart — 基于固定 12 个月坐标轴的 Highcharts 组合图：
//   • 柱形图：当月收支（当月存入），使用右侧纵轴
//   • 折线图：累计收支（累计本金，金色，与 IncomeChart 的累计损益一致），使用左侧纵轴
// 当月存入与累计本金的数量级差异很大，因此使用两条纵轴。
// 布局沿用 IncomeChart，但展示的是存入（deposit/cumPrincipal），而非投资损益。

import { Card } from 'antd'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { useMemo } from 'react'
import { computeSeries, type Row } from '../../domain/compute'
import type { MonthRow } from '../../domain/wallet'
import { compactYuan } from '../format'
import { COLORS } from '../theme'

const FULL_MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))

const byMonth = (rows: Row[]) => Object.fromEntries(rows.map((r) => [r.month, r]))

interface Props {
  months: MonthRow[]
}

export function SavingsChart({ months }: Props) {
  const options = useMemo<Highcharts.Options>(() => {
    const rows = byMonth(computeSeries(months).rows)

    const col = (key: keyof Row) =>
      FULL_MONTHS.map((m) => (rows[m] ? (rows[m][key] as number) : null))

    const barData = FULL_MONTHS.map((m) => {
      const r = rows[m]
      if (!r) return null
      return { y: r.deposit, color: r.deposit >= 0 ? COLORS.upBar : COLORS.downBar }
    })

    return {
      chart: { type: 'line', backgroundColor: 'transparent', spacing: [12, 4, 0, 0] },
      title: { text: undefined },
      credits: { enabled: false },
      legend: { enabled: false }, // 自定义图例由标记结构渲染
      xAxis: {
        categories: FULL_MONTHS.map((m) => parseInt(m, 10) + '月'),
        lineColor: '#f0f2f5',
        tickWidth: 0,
        labels: { style: { color: '#9aa0a8', fontSize: '12px' } },
      },
      yAxis: [
        {
          title: { text: undefined },
          gridLineWidth: 0,
          opposite: true,
          labels: {
            formatter() {
              return compactYuan(this.value as number)
            },
            style: { color: '#aab0b8', fontSize: '11px' },
          },
        },
        {
          title: { text: undefined },
          gridLineColor: '#f0f2f5',
          labels: {
            formatter() {
              return compactYuan(this.value as number)
            },
            style: { color: COLORS.gold, fontSize: '11px' },
          },
        },
      ],
      plotOptions: {
        series: {
          enableMouseTracking: false, // 禁用悬停和提示框交互
        },
        column: { borderRadius: 4, pointPadding: 0.18, groupPadding: 0.22 },
        line: { lineWidth: 2 },
      },
      series: [
        {
          type: 'column',
          name: '当月收支',
          data: barData,
          yAxis: 0,
          zIndex: 1,
          dataLabels: {
            enabled: true,
            formatter() {
              const v = this.y as number
              if (!v) return undefined
              return (v < 0 ? '−' : '') + '¥' + Math.round(Math.abs(v)).toLocaleString('zh-CN')
            },
            style: {
              color: COLORS.muted,
              fontSize: '11px',
              fontWeight: '500',
              textOutline: '3px #fff',
            },
            y: -6,
          },
        },
        {
          type: 'line',
          name: '累计收支',
          data: col('cumPrincipal'),
          color: COLORS.gold,
          yAxis: 1,
          zIndex: 2,
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
      ],
    }
  }, [months])

  return (
    <Card className="card reveal" variant="borderless" style={{ animationDelay: '.24s' }}>
      <h2>累计收支走势</h2>
      <div className="legend">
        <span className="lg">
          <span className="mk line" style={{ background: COLORS.gold }} />
          累计收支
        </span>
        <span className="lg">
          <span className="mk bar" />
          当月收支
        </span>
      </div>
      <div className="chart-box">
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
          containerProps={{ style: { width: '100%' } }}
        />
      </div>
    </Card>
  )
}
