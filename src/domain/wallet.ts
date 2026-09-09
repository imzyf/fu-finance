// Fu Finance 钱包契约——客户端与服务端共享的唯一事实来源。
//
// 每月仅记录三项原始事实：月份、逐笔存入（deposits）和当月投资损益合计。
// 所有派生数值（累计本金、银行利息、收益率和倍数）均在 compute.ts 中计算，
// 不在此处手工填写。

export interface Deposit {
  /** 金额，单位为元。 */
  amount: number
  /** 自由填写的存入说明，例如“爸爸月度存款”。 */
  notes: string
}

export interface MonthRow {
  /** 月份，取值为 '01' 至 '12'。 */
  month: string
  /** 逐笔存入；当月存入合计 = Σ amount（空数组按 0 计）。 */
  deposits: Deposit[]
  /** 当月投资损益合计，可以为负数。 */
  investIncome: number
}

export interface WalletData {
  year: number
  months: MonthRow[]
}
