// theme.ts — shared color tokens, ported from the original CSS custom properties.
// Reused by KpiCards, IncomeChart and DetailTable so the palette stays in one place.

export const COLORS = {
  blue: '#1677ff', // 支付宝蓝 / Alipay blue (AntD colorPrimary)
  gold: '#fa8c16', // 基金金橙：主损益线
  bankGray: '#c8ced6', // 银行 1.4% 线
  band: 'rgba(22,119,255,.24)', // 目标 3.3%–5% 走廊填充
  up: '#fa5151', // 涨/赚 → 红
  down: '#00b578', // 跌/亏 → 绿
  upBar: 'rgba(250,81,81,.9)', // 柱子：当月损益 ≥ 0
  downBar: 'rgba(0,181,120,.85)', // 柱子：当月损益 < 0
  muted: '#8a9099',
  faint: '#b6bcc4',
} as const

/** Text color for a signed value (涨红跌绿); zero falls back to the given neutral. */
export const signColor = (n: number, neutral: string = COLORS.faint): string =>
  n > 0 ? COLORS.up : n < 0 ? COLORS.down : neutral
