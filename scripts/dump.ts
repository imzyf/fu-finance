// dump.ts — 备份：把 Neon 权威数据导出成一个可提交的快照 snapshots/wallet.json。
//
// 目的（两件事，都靠 git 而非本脚本实现）：
//   1) 历史/审计：每次导出覆盖同一个文件，`git diff` 就能看出这个月新增/改了哪几行。
//   2) 仓内备份：Neon 挂了 / dev branch 被清了，快照还在 git 里，可据此重灌。
//
// 关键设计——文件里【不写时间戳、不写任何易变字段】：数据没变 → 文件逐字节相同 →
// git diff 为空。只有真实数据变化才产生 diff。这才是「git 当历史」的正确形态。
//
// 形状 = 两表的原始行（faithful mirror，非 assembleWallet 后的形状），因此可无损还原：
//   - amount 保持 numeric 的 string 形态（不转 number，避免浮点漂移，6666.66 精确）。
//   - 按 (date, id) 稳定排序，保证同样的数据每次导出行序一致。
//
// 运行：`make dump`（经 tsx，读 .dev.vars 的 DATABASE_URL，默认导 dev branch）。

import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { investments, deposits } from '../src/db/schema'
import { databaseUrl } from './env'

const OUT = new URL('../snapshots/wallet.json', import.meta.url)

async function main() {
  const db = drizzle(neon(databaseUrl()))

  const [investmentRows, depositRows] = await Promise.all([
    db.select().from(investments),
    db.select().from(deposits),
  ])

  // 稳定排序：先按 date，再按 id。保证「数据没变则文件不变」。
  const byDateThenId = <T extends { date: string; id: number }>(rows: T[]): T[] =>
    [...rows].sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id)

  const snapshot = {
    investments: byDateThenId(investmentRows),
    deposits: byDateThenId(depositRows),
  }

  mkdirSync(dirname(fileURLToPath(OUT)), { recursive: true })
  writeFileSync(OUT, JSON.stringify(snapshot, null, 2) + '\n')

  console.log(
    `Dumped ${snapshot.investments.length} investments + ${snapshot.deposits.length} deposits → snapshots/wallet.json`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
