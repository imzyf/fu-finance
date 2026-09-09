// format.ts — display formatters ported verbatim from the original index.html.
// Pure string helpers; no DOM.

/** ¥1,234.56 — always two decimals, zh-CN grouping. */
export const yuan = (n: number): string =>
  '¥' + Number(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** +¥1,234.56 / −¥1,234.56 — signed, using the figure-dash '−' for negatives. */
export const signedYuan = (n: number): string =>
  (n >= 0 ? '+' : '−') +
  '¥' +
  Math.abs(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** ¥4k / −¥1.5k — compact axis label; values under 1000 show plain. */
export const compactYuan = (n: number): string => {
  const abs = Math.abs(n)
  const sign = n < 0 ? '−' : ''
  if (abs >= 1000) {
    const k = abs / 1000
    return sign + '¥' + (Number.isInteger(k) ? k : k.toFixed(1)) + 'k'
  }
  return sign + '¥' + abs.toLocaleString('zh-CN')
}

/** '03' -> '3月' */
export const monthLabel = (m: string): string => parseInt(m, 10) + '月'

/** 涨红跌绿 sign bucket: positive -> 'up', negative -> 'down', zero -> 'dim'. */
export const signClass = (n: number): 'up' | 'down' | 'dim' => (n > 0 ? 'up' : n < 0 ? 'down' : 'dim')
