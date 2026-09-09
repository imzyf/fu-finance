// assembleWallet.test.ts — locks the DB→WalletData assembly contract (pure, no DB).

import { describe, it, expect } from 'vitest'
import { assembleWallet } from './assembleWallet'

describe('assembleWallet', () => {
  it('derives year/month from date and converts numeric strings to numbers', () => {
    const result = assembleWallet(
      [{ date: '2026-03-01', amount: '-1008.34' }],
      [{ date: '2026-03-01', amount: '600.00', notes: '爷奶 月度存储' }],
    )

    expect(result.year).toBe(2026)
    expect(result.months).toEqual([
      {
        month: '03',
        investIncome: -1008.34,
        deposits: [{ amount: 600, notes: '爷奶 月度存储' }],
      },
    ])
  })

  it('sums multiple investment rows in the same month', () => {
    const result = assembleWallet(
      [
        { date: '2026-05-01', amount: '500.00' },
        { date: '2026-05-01', amount: '29.44' },
      ],
      [],
    )

    expect(result.months).toHaveLength(1)
    expect(result.months[0].investIncome).toBeCloseTo(529.44, 2)
  })

  it('keeps each deposit as its own itemized row', () => {
    const result = assembleWallet(
      [{ date: '2026-02-01', amount: '44.73' }],
      [
        { date: '2026-02-01', amount: '666.00', notes: '外婆 新年红包' },
        { date: '2026-02-01', amount: '666.00', notes: '外公 新年红包' },
      ],
    )

    expect(result.months[0].deposits).toEqual([
      { amount: 666, notes: '外婆 新年红包' },
      { amount: 666, notes: '外公 新年红包' },
    ])
  })

  it('builds the month list from the union of both tables and sorts ascending', () => {
    const result = assembleWallet(
      [{ date: '2026-04-01', amount: '1196.67' }],
      [{ date: '2026-02-01', amount: '1000.00', notes: '爸妈 月度存储' }],
    )

    expect(result.months.map((m) => m.month)).toEqual(['02', '04'])
  })

  it('hides a trailing month that has deposits but no investments row yet (current month not filled in)', () => {
    const result = assembleWallet(
      [{ date: '2026-05-01', amount: '529.44' }],
      [
        { date: '2026-05-01', amount: '1000.00', notes: '爸妈 月度存储' },
        { date: '2026-06-01', amount: '600.00', notes: '爷奶 月度存储' },
      ],
    )

    // 06 只有存入、投资未录入 → 暂不显示；05 已录入照常显示。
    expect(result.months.map((m) => m.month)).toEqual(['05'])
  })

  it('keeps a month whose investments row is amount 0 (recorded, not missing)', () => {
    const result = assembleWallet(
      [{ date: '2026-06-01', amount: '0.00' }],
      [{ date: '2026-06-01', amount: '600.00', notes: '爷奶 月度存储' }],
    )

    expect(result.months[0]).toEqual({
      month: '06',
      investIncome: 0,
      deposits: [{ amount: 600, notes: '爷奶 月度存储' }],
    })
  })

  it('supports an empty month (investments row with amount 0, no deposits)', () => {
    const result = assembleWallet([{ date: '2026-01-01', amount: '0' }], [])

    expect(result.months[0]).toEqual({ month: '01', investIncome: 0, deposits: [] })
  })

  it('returns a legal empty panel when the database is empty', () => {
    expect(assembleWallet([], [])).toEqual({ year: 2026, months: [] })
  })
})
