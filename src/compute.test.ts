import { describe, expect, it } from 'vitest'
import { computeSeries } from './compute'
import type { MonthRow } from './data/types'

// A fixed, hand-computable fixture. Deliberately independent of the live wallet
// data (Neon → assembleWallet) so editing real figures never breaks these math tests.
//
//   month  deposit            investIncome   cumPrincipal   cumIncome
//   01     0                  0              0              0
//   02     1000+2000 = 3000   +50            3000           50
//   03     1500              -200            4500          -150
//   04     500               +120            5000          -30
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

// Small single-month helper for focused unit behaviors.
const m = (month: string, deposits: MonthRow['deposits'], investIncome: number): MonthRow => ({
  month,
  deposits,
  investIncome,
})

describe('computeSeries — deposit aggregation', () => {
  it('sums itemized deposits into the monthly deposit total', () => {
    const { rows } = computeSeries([
      m('01', [
        { amount: 100, notes: 'a' },
        { amount: 50, notes: 'b' },
      ], 0),
    ])
    expect(rows[0].deposit).toBe(150)
  })

  it('treats an empty deposits list as a deposit of 0', () => {
    const { rows } = computeSeries([m('01', [], 0)])
    expect(rows[0].deposit).toBe(0)
  })
})

describe('computeSeries — zero-principal month', () => {
  it('returns null realIdx/bankIdx when cumulative principal is 0', () => {
    const { rows } = computeSeries([m('01', [], 0)])
    expect(rows[0].cumPrincipal).toBe(0)
    expect(rows[0].realIdx).toBeNull()
    expect(rows[0].bankIdx).toBeNull()
  })
})

describe('computeSeries — bank interest accrual', () => {
  it('accrues monthly interest as cumPrincipal × rate/12 at the default 1.4%', () => {
    const { rows } = computeSeries([m('01', [{ amount: 1200, notes: '' }], 0)])
    // 1200 × 0.014 / 12 = 1.4
    expect(rows[0].bankInterest).toBeCloseTo(1.4, 10)
  })

  it('honors a bankRate override (target corridor 5%)', () => {
    const { rows } = computeSeries([m('01', [{ amount: 1200, notes: '' }], 0)], 0.05)
    // 1200 × 0.05 / 12 = 5
    expect(rows[0].bankInterest).toBeCloseTo(5, 10)
  })
})

describe('computeSeries — cumulative series on the fixture', () => {
  const { rows } = computeSeries(FIXTURE)

  it('runs cumulative principal correctly', () => {
    expect(rows.map((r) => r.cumPrincipal)).toEqual([0, 3000, 4500, 5000])
  })

  it('runs cumulative invest income, handling the negative month (03)', () => {
    expect(rows[2].investIncome).toBe(-200)
    expect(rows.map((r) => r.cumIncome)).toEqual([0, 50, -150, -30])
  })

  it('derives realValue = cumPrincipal + cumIncome', () => {
    expect(rows[3].realValue).toBe(5000 + -30) // 4970
  })

  it('derives bankValue = cumPrincipal + cumBankInterest', () => {
    const r = rows[3]
    expect(r.bankValue).toBeCloseTo(r.cumPrincipal + r.cumBankInterest, 10)
  })

  it('accumulates bank interest month over month', () => {
    // 02: 3000×0.014/12=3.5 ; 03: 4500×…=5.25 ; 04: 5000×…=5.8333…
    expect(rows[3].cumBankInterest).toBeCloseTo(3.5 + 5.25 + 5000 * (0.014 / 12), 10)
  })
})

describe('computeSeries — totals', () => {
  const { totals } = computeSeries(FIXTURE)

  it('reports cumulative principal and invest income', () => {
    expect(totals.cumPrincipal).toBe(5000)
    expect(totals.investIncome).toBe(-30)
  })

  it('computes investIncomeRate = cumIncome / cumPrincipal', () => {
    expect(totals.investIncomeRate).toBeCloseTo(-30 / 5000, 10)
  })

  it('computes multiple = cumIncome / cumBankInterest', () => {
    expect(totals.multiple).toBeCloseTo(totals.investIncome / totals.bankInterest, 10)
  })

  it('returns 0 for rate/multiple fields when principal is 0', () => {
    const { totals: t } = computeSeries([m('01', [], 0)])
    expect(t.investIncomeRate).toBe(0)
    expect(t.bankInterestRate).toBe(0)
    expect(t.multiple).toBe(0)
  })
})
