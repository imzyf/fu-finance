import { describe, expect, it } from 'vitest'
import { computeSeries } from './compute'
import { deriveKpis } from './kpi'
import type { MonthRow } from './wallet'

// 固定测试数据，与实时钱包数据无关（数据表见 compute.test.ts）。
//   累计本金（cumPrincipal）：0, 3000, 4500, 5000 → Σ = 12500
//   累计损益（cumIncome，即 totals.investIncome）：-30
const FIXTURE: MonthRow[] = [
  { month: '01', deposits: [], investIncome: 0 },
  {
    month: '02',
    deposits: [
      { amount: 1000, notes: 'a' },
      { amount: 2000, notes: 'b' },
    ],
    investIncome: 50,
  },
  { month: '03', deposits: [{ amount: 1500, notes: 'c' }], investIncome: -200 },
  { month: '04', deposits: [{ amount: 500, notes: 'd' }], investIncome: 120 },
]

describe('deriveKpis — the headline numbers', () => {
  const { rows, totals } = computeSeries(FIXTURE)
  const kpi = deriveKpis(rows, totals)

  it('totalAmount = last row realValue', () => {
    expect(kpi.totalAmount).toBe(5000 + -30) // 4970
  })

  it('echoes cumulative principal and invest income from totals', () => {
    expect(kpi.cumPrincipal).toBe(5000)
    expect(kpi.investIncome).toBe(-30)
    expect(kpi.investIncomeRate).toBeCloseTo(-30 / 5000, 10)
  })

  it('multiple and bankInterest come from totals', () => {
    expect(kpi.multiple).toBeCloseTo(totals.multiple, 10)
    expect(kpi.bankInterest).toBeCloseTo(totals.bankInterest, 10)
  })

  it('principal-weighted annualized rate = investIncome × 12 / Σ(cumPrincipal)', () => {
    // -30 × 12 / 12500 = -0.0288
    expect(kpi.annualizedRate).toBeCloseTo((-30 * 12) / 12500, 10)
  })

  it('lead = investIncome − bankInterest', () => {
    expect(kpi.lead).toBeCloseTo(totals.investIncome - totals.bankInterest, 10)
  })
})

describe('deriveKpis — empty / zero-principal safety', () => {
  it('annualizedRate is 0 when there is no principal', () => {
    const { rows, totals } = computeSeries([{ month: '01', deposits: [], investIncome: 0 }])
    const kpi = deriveKpis(rows, totals)
    expect(kpi.annualizedRate).toBe(0)
    expect(kpi.totalAmount).toBe(0)
  })
})
