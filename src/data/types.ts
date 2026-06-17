// 福宝钱包 raw input shape — the single source of truth.
//
// Only three raw facts are recorded per month: which month, the itemized cash-in
// (deposits), and the aggregate monthly invest income. Every derived number
// (cumulative principal, bank interest, rates, multiple) is computed in compute.ts
// — never hand-written here.

export interface Deposit {
  /** yuan */
  amount: number
  /** e.g. '爸爸月度存款' — free-form description of this cash-in */
  notes: string
}

export interface MonthRow {
  /** '01'..'12' */
  month: string
  /** itemized cash-in; the month's deposit total = Σ amount (empty = 0) */
  deposits: Deposit[]
  /** 当月投资收入 — monthly aggregate, may be negative */
  investIncome: number
}

export interface WalletData {
  year: number
  months: MonthRow[]
}
