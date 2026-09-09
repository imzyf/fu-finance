// format.ts — 从原 index.html 原样迁移的显示格式化函数。
// 仅处理字符串，不涉及 DOM。

/** ¥1,234.56 — 始终保留两位小数，并按 zh-CN 规则分组。 */
export const yuan = (n: number): string =>
  '¥' + Number(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** +¥1,234.56 / −¥1,234.56 — 显示正负号，负数使用数字专用负号“−”。 */
export const signedYuan = (n: number): string =>
  (n >= 0 ? '+' : '−') +
  '¥' +
  Math.abs(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** ¥4k / −¥1.5k — 紧凑的坐标轴标签；小于 1000 的值直接显示。 */
export const compactYuan = (n: number): string => {
  const abs = Math.abs(n)
  const sign = n < 0 ? '−' : ''
  if (abs >= 1000) {
    const k = abs / 1000
    return sign + '¥' + (Number.isInteger(k) ? k : k.toFixed(1)) + 'k'
  }
  return sign + '¥' + abs.toLocaleString('zh-CN')
}

/** 将 '03' 转为 '3月'。 */
export const monthLabel = (m: string): string => parseInt(m, 10) + '月'

/** 涨红跌绿的符号分组：正数为 'up'，负数为 'down'，零为 'dim'。 */
export const signClass = (n: number): 'up' | 'down' | 'dim' => (n > 0 ? 'up' : n < 0 ? 'down' : 'dim')
