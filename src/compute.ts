// compute.ts — derive every display series from the raw input (pure: no DOM, no side effects).
//
// 口径（与历史 compute.js 一致）：
//   当月存入   deposit         = Σ deposits[].amount
//   累计本金   cumPrincipal    = Σ deposit
//   累计损益   cumIncome       = Σ investIncome（可负）
//   理财真实值 realValue       = cumPrincipal + cumIncome
//   银行利息   bankInterest    = 当月累计本金 × rate / 12（逐月在累计本金上计息）
//   累计银行   cumBankInterest = Σ bankInterest
//   银行账户值 bankValue       = cumPrincipal + cumBankInterest
//   损益率视图 realIdx/bankIdx = 100 × 账户值 / 累计本金（本金为 0 时为 null）
//
// 目标 3.3%–5% 走廊复用同一函数，仅传入不同 bankRate（无独立代码路径）。

import type { MonthRow } from './data/types'

/** 银行固定年化 1.4% */
export const BANK_ANNUAL_RATE = 0.014

export interface Row {
  month: string
  /** 当月存入合计 = Σ deposits[].amount */
  deposit: number
  /** 当月投资损益（可负） */
  investIncome: number
  /** 累计投资损益 */
  cumIncome: number
  cumPrincipal: number
  realValue: number
  /** 当月银行利息 */
  bankInterest: number
  /** 累计银行利息 */
  cumBankInterest: number
  bankValue: number
  /** 100 × realValue / cumPrincipal；本金为 0 时 null */
  realIdx: number | null
  /** 100 × bankValue / cumPrincipal；本金为 0 时 null */
  bankIdx: number | null
}

export interface Totals {
  cumPrincipal: number
  investIncome: number
  investIncomeRate: number
  bankInterest: number
  bankInterestRate: number
  multiple: number
}

export interface Series {
  rows: Row[]
  totals: Totals
}

export function computeSeries(months: MonthRow[], bankRate: number = BANK_ANNUAL_RATE): Series {
  let cumPrincipal = 0
  let cumIncome = 0
  let cumBankInterest = 0

  const rows: Row[] = months.map((mo) => {
    const deposit = mo.deposits.reduce((sum, d) => sum + d.amount, 0)
    cumPrincipal += deposit
    cumIncome += mo.investIncome

    const bankInterest = (cumPrincipal * bankRate) / 12 // 当月银行利息
    cumBankInterest += bankInterest

    const realValue = cumPrincipal + cumIncome
    const bankValue = cumPrincipal + cumBankInterest

    // 归一化损益率视图（起点 100）。本金为 0 时取 null，折线自然断开，避免除零。
    const realIdx = cumPrincipal > 0 ? (100 * realValue) / cumPrincipal : null
    const bankIdx = cumPrincipal > 0 ? (100 * bankValue) / cumPrincipal : null

    return {
      month: mo.month,
      deposit,
      investIncome: mo.investIncome,
      cumIncome,
      cumPrincipal,
      realValue,
      bankInterest,
      cumBankInterest,
      bankValue,
      realIdx,
      bankIdx,
    }
  })

  const last = rows.length ? rows[rows.length - 1] : { cumPrincipal: 0 }
  const totals: Totals = {
    cumPrincipal: last.cumPrincipal || 0,
    investIncome: cumIncome,
    investIncomeRate: last.cumPrincipal ? cumIncome / last.cumPrincipal : 0,
    bankInterest: cumBankInterest,
    bankInterestRate: last.cumPrincipal ? cumBankInterest / last.cumPrincipal : 0,
    multiple: cumBankInterest ? cumIncome / cumBankInterest : 0,
  }

  return { rows, totals }
}
