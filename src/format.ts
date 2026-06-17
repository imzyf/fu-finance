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

/** '03' -> '3月' */
export const monthLabel = (m: string): string => parseInt(m, 10) + '月'

/** 涨红跌绿 sign bucket: positive -> 'up', negative -> 'down', zero -> 'dim'. */
export const signClass = (n: number): 'up' | 'down' | 'dim' => (n > 0 ? 'up' : n < 0 ? 'down' : 'dim')
