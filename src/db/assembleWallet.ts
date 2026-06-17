// assembleWallet — pure assembly from DB rows to WalletData. No DB, no side effects (unit-testable).
//
// 职责（把 DB 形状装配成前端形状）：
//   - date 'YYYY-MM-01' → year(number) + month('MM')，直接 split('-')，不经 JS Date（避时区偏移）。
//   - numeric(string) → number。
//   - 某月 investIncome = 该月 investments.amount 之和（多笔求和）。
//   - 月份清单 = investments.date ∪ deposits.date（并集）；某月缺投资行 → investIncome 按 0。
//   - 按 month 升序。空库 → { year: DEFAULT_YEAR, months: [] }。
//
// 当前单一年份；year 取自任一行的 date。多年份 out of scope。

import type { WalletData, MonthRow, Deposit } from '../data/types'

/** 行的最小形状（只取装配需要的列），与 schema 的 $inferSelect 兼容。 */
interface InvestmentInput {
  date: string
  amount: string
}
interface DepositInput {
  date: string
  amount: string
  notes: string
}

/** 空库时的回退年份（当前面板年份）。 */
const DEFAULT_YEAR = 2026

/** 'YYYY-MM-DD' → { year, month }；纯字符串切分，避开时区。 */
function splitYearMonth(date: string): { year: number; month: string } {
  const [year, month] = date.split('-')
  return { year: Number(year), month }
}

export function assembleWallet(
  investmentRows: InvestmentInput[],
  depositRows: DepositInput[],
): WalletData {
  // month('MM') → 累加器
  const byMonth = new Map<string, { investIncome: number; deposits: Deposit[] }>()
  let year: number | null = null

  const ensure = (month: string) => {
    let entry = byMonth.get(month)
    if (!entry) {
      entry = { investIncome: 0, deposits: [] }
      byMonth.set(month, entry)
    }
    return entry
  }

  for (const row of investmentRows) {
    const { year: y, month } = splitYearMonth(row.date)
    year ??= y
    ensure(month).investIncome += Number(row.amount)
  }

  for (const row of depositRows) {
    const { year: y, month } = splitYearMonth(row.date)
    year ??= y
    ensure(month).deposits.push({ amount: Number(row.amount), notes: row.notes })
  }

  const months: MonthRow[] = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { investIncome, deposits }]) => ({ month, deposits, investIncome }))

  return { year: year ?? DEFAULT_YEAR, months }
}
