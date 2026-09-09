// kpi.ts — 从计算结果序列中派生横幅的核心数值。
//
// 以下字段与原 index.html 横幅完全一致：
//   总金额        totalAmount      = 最后一行 realValue（无数据时退回 cumPrincipal + investIncome）
//   本金          cumPrincipal     = totals.cumPrincipal
//   投资损益      investIncome     = totals.investIncome
//   损益率        investIncomeRate = totals.investIncomeRate
//   年化（本金加权）annualizedRate  = investIncome × 12 / Σ(每月 cumPrincipal)
//   损益倍数      multiple         = totals.multiple
//   比定存        lead             = investIncome − bankInterest
//   定存损益      bankInterest     = totals.bankInterest

import type { Row, Totals } from './compute'

export interface Kpis {
  totalAmount: number
  cumPrincipal: number
  investIncome: number
  investIncomeRate: number
  annualizedRate: number
  multiple: number
  lead: number
  bankInterest: number
}

export function deriveKpis(rows: Row[], totals: Totals): Kpis {
  const last = rows.length ? rows[rows.length - 1] : null
  const totalAmount = last ? last.realValue : totals.cumPrincipal + totals.investIncome

  // 本金加权年化：累计损益 × 12 ÷ Σ(每月累计本金)，与银行/目标走廊同口径。
  const sumCumPrincipal = rows.reduce((s, r) => s + r.cumPrincipal, 0)
  const annualizedRate = sumCumPrincipal > 0 ? (totals.investIncome * 12) / sumCumPrincipal : 0

  return {
    totalAmount,
    cumPrincipal: totals.cumPrincipal,
    investIncome: totals.investIncome,
    investIncomeRate: totals.investIncomeRate,
    annualizedRate,
    multiple: totals.multiple,
    lead: totals.investIncome - totals.bankInterest,
    bankInterest: totals.bankInterest,
  }
}
