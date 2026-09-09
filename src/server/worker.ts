// Worker — 运行时读取路径。GET /api/wallet 查询 Neon 中的两张表 → assembleWallet → JSON。
//
// 使用 neon-http 驱动（HTTP，Workers 内无需 nodejs_compat）。DATABASE_URL 仅作为 Worker 密钥，
// 浏览器永不接触。其余 /api/* 返回 404；非 /api/* 由静态资源（SPA）处理（见 config/wrangler.jsonc
// 的 run_worker_first: ["/api/*"]，确保 /api/wallet 优先进入 Worker 而非被 SPA 回退吞掉）。

import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { investments, deposits } from './db/schema'
import { assembleWallet } from './db/assembleWallet'

export interface Env {
  DATABASE_URL: string
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url)

    if (req.method === 'GET' && url.pathname === '/api/wallet') {
      const db = drizzle(neon(env.DATABASE_URL))
      const [investmentRows, depositRows] = await Promise.all([
        db.select().from(investments),
        db.select().from(deposits),
      ])
      return Response.json(assembleWallet(investmentRows, depositRows), {
        headers: { 'cache-control': 'no-store' },
      })
    }

    return new Response('Not found', { status: 404 })
  },
}
