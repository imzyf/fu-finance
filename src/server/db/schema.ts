// Drizzle 表定义——不依赖环境，由 Worker、数据导出和测试共用。
//
// 两张相互独立、无外键的表，都用单个 `date` 列（取当月 1 号 'YYYY-MM-01'）。
// 年/月从 date 派生，不单独存 year/month。某月投资收入 = 该月 investments.amount 之和。
//
// 金额用 numeric(12,2)（可正确表示 6666.66、可负如 -1008.34）。Drizzle 默认把
// numeric 按字符串返回；date 使用 mode:'string' 返回 'YYYY-MM-DD'，避开 JS Date 时区问题。

import { pgTable, date, numeric, serial, text } from 'drizzle-orm/pg-core'

export const investments = pgTable('investments', {
  id: serial('id').primaryKey(),
  // 当月（取 1 号），date 不唯一：某月可有多笔投资收入
  date: date('date', { mode: 'string' }).notNull(),
  // 单笔投资收入，可为负
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull().default('0'),
})

export const deposits = pgTable('deposits', {
  id: serial('id').primaryKey(),
  // 当月（取 1 号），date 不唯一：某月可有多笔存入
  date: date('date', { mode: 'string' }).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  notes: text('notes').notNull().default(''),
})

export type InvestmentRow = typeof investments.$inferSelect
export type DepositRow = typeof deposits.$inferSelect
