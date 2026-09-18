// theme.ts — 从原 CSS 自定义属性迁移而来的共享颜色令牌。
// KpiCards、IncomeChart 和 DetailTable 共用这些颜色，确保调色板集中维护。

export const COLORS = {
  blue: '#1677ff', // 支付宝蓝（AntD colorPrimary）
  gold: '#d48806', // 基金金色：主累计趋势线
  goldText: '#8c5a00', // 金色系列的坐标轴与数据标签
  bankGray: '#98a2b3', // 银行 1.4% 线
  band: 'rgba(36,104,199,.18)', // 目标 3.3%–5% 走廊填充
  up: '#d9363e', // 涨/赚 → 红
  down: '#00875a', // 跌/亏 → 绿
  axis: '#667085',
  axisLine: '#d8dee8',
  grid: '#e7ecf2',
  zeroLine: '#b8c1cd',
  muted: '#667085',
  faint: '#b6bcc4',
} as const

/** 带符号数值的文字颜色（涨红跌绿）；零值使用传入的中性色。 */
export const signColor = (n: number, neutral: string = COLORS.faint): string =>
  n > 0 ? COLORS.up : n < 0 ? COLORS.down : neutral
