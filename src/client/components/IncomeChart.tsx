// IncomeChart — 基于固定 12 个月坐标轴的 Highcharts 组合图：
//   • 柱形图：当月损益（每个数据点采用涨红跌绿），使用右侧纵轴
//   • 折线图：累计损益（金色），使用左侧纵轴
//   • 折线图：银行定存 1.4%（灰色），使用左侧纵轴
//   • 区域范围图：目标 3.3%–5% 走廊（蓝色带，位于所有图层下方），使用左侧纵轴
// 目标走廊复用 computeSeries()，分别传入 bankRate 0.033 和 0.05，无独立计算逻辑。

import { Card } from 'antd'
import Highcharts from 'highcharts'
import 'highcharts/highcharts-more'
import { HighchartsReact } from 'highcharts-react-official'
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
      return { y: r.investIncome, color: r.investIncome >= 0 ? COLORS.up : COLORS.down }
    })

    const bankData = col('cumBankInterest')

    return {
      chart: {
        type: 'line',
        backgroundColor: 'transparent',
        spacing: [12, 2, 0, 8],
        alignThresholds: true,
      },
      title: { text: undefined },
      credits: { enabled: false },
      legend: { enabled: false }, // 自定义图例由标记结构渲染
      xAxis: {
        categories: FULL_MONTHS.map((m) => parseInt(m, 10) + '月'),
        lineColor: COLORS.axisLine,
        tickWidth: 0,
        labels: { style: { color: COLORS.axis, fontSize: '12px' } },
      },
      yAxis: [
        {
          title: { text: undefined },
          gridLineWidth: 0,
          opposite: true,
          labels: {
            x: 6,
            formatter() {
              return compactYuan(this.value as number)
            },
            style: { color: COLORS.axis, fontSize: '11px' },
          },
        },
        {
          title: { text: undefined },
          gridLineColor: COLORS.grid,
          plotLines: [{ value: 0, color: COLORS.zeroLine, width: 1, zIndex: 2 }],
          labels: {
            x: -6,
            formatter() {
              return compactYuan(this.value as number)
            },
            style: { color: COLORS.goldText, fontSize: '11px' },
          },
        },
      ],
      plotOptions: {
        series: {
          enableMouseTracking: false, // 禁用悬停和提示框交互
        },
        column: { borderWidth: 0, borderRadius: 4, pointPadding: 0.18, groupPadding: 0.22 },
        line: { lineWidth: 2 },
      },
      series: [
        {
          type: 'arearange',
          name: '年利化 3.3%–5%',
          // null 项在运行时渲染为断点；Highcharts 的静态类型在此处未包含 null。
          data: bandData as unknown as Highcharts.SeriesArearangeOptions['data'],
          color: COLORS.band,
          fillColor: COLORS.band,
          yAxis: 1,
          lineWidth: 0,
          zIndex: 0,
          enableMouseTracking: false,
          marker: { enabled: false },
        },
        {
          type: 'column',
          name: '当月损益',
          data: barData,
          yAxis: 0,
          threshold: 0,
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
            distance: 6,
          },
        },
        {
          type: 'line',
          name: '累计损益',
          data: col('cumIncome'),
          color: COLORS.gold,
          yAxis: 1,
          threshold: 0,
          zIndex: 3,
          marker: { enabled: true, radius: 3 },
          dataLabels: {
            enabled: true,
            formatter() {
              const v = this.y as number
              return (v < 0 ? '−' : '') + '¥' + Math.round(Math.abs(v)).toLocaleString('zh-CN')
            },
            style: {
              color: COLORS.goldText,
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
          yAxis: 1,
          zIndex: 2,
          marker: { enabled: true, radius: 3 },
        },
      ],
    }
  }, [months])

  return (
    <Card className="card reveal" variant="borderless" style={{ animationDelay: '.2s' }}>
      <h2>累计损益走势</h2>
      <div className="legend">
        <span className="lg">
          <span className="mk line" style={{ background: COLORS.gold }} />
          累计损益
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
          当月损益
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
