// assembleWallet — pure assembly from DB rows to WalletData. No DB, no side effects (unit-testable).
//
// 职责（把 DB 形状装配成前端形状）：
//   - date 'YYYY-MM-01' → year(number) + month('MM')，直接 split('-')，不经 JS Date（避时区偏移）。
//   - numeric(string) → number。
//   - 某月 investIncome = 该月 investments.amount 之和（多笔求和）。
//   - 月份清单 = investments.date ∪ deposits.date（并集）；某月缺投资行 → investIncome 按 0。
//   - 末尾若干个「只有存入、还没录入投资」的月份先隐藏（当月投资未填 → 暂不显示，
//     避免显示成"零损益"）。amount 0 的投资行算已录入，照常显示。
//   - 按 month 升序。空库 → { year: DEFAULT_YEAR, months: [] }。
//
// 当前单一年份；year 取自任一行的 date。多年份 out of scope。

import type { WalletData, MonthRow, Deposit } from '../../domain/wallet'

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
  // month('MM') → 累加器（hasInvestment：该月是否已有投资记录，amount 0 也算）
  const byMonth = new Map<
    string,
    { investIncome: number; hasInvestment: boolean; deposits: Deposit[] }
  >()
  let year: number | null = null

  const ensure = (month: string) => {
    let entry = byMonth.get(month)
    if (!entry) {
      entry = { investIncome: 0, hasInvestment: false, deposits: [] }
      byMonth.set(month, entry)
    }
    return entry
  }

  for (const row of investmentRows) {
    const { year: y, month } = splitYearMonth(row.date)
    year ??= y
    const entry = ensure(month)
    entry.investIncome += Number(row.amount)
    entry.hasInvestment = true
  }

  for (const row of depositRows) {
    const { year: y, month } = splitYearMonth(row.date)
    year ??= y
    ensure(month).deposits.push({ amount: Number(row.amount), notes: row.notes })
  }

  const sorted = [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b))

  // 末尾「只有存入、投资未录入」的月份先隐藏（当月投资还没填）。只删末尾，
  // 保持中间月份的累计连续性。
  while (sorted.length > 0 && !sorted[sorted.length - 1][1].hasInvestment) {
    sorted.pop()
  }

  const months: MonthRow[] = sorted.map(([month, { investIncome, deposits }]) => ({
    month,
    deposits,
    investIncome,
  }))

  return { year: year ?? DEFAULT_YEAR, months }
}
