// env.ts — resolve DATABASE_URL for local tooling (dump / drizzle-kit).
//
// 优先用进程环境变量；否则回退读取 gitignored 的 .dev.vars（dev branch 连接串）。
// 自己解析 .dev.vars（而非 shell source），避免 Neon URL 里的 `?`/`&` 被 shell 当特殊字符。

import { readFileSync } from 'node:fs'

export function databaseUrl(): string {
  const fromEnv = process.env.DATABASE_URL
  if (fromEnv) return fromEnv

  try {
    const text = readFileSync(new URL('../.dev.vars', import.meta.url), 'utf8')
    for (const line of text.split('\n')) {
      const match = line.match(/^\s*DATABASE_URL\s*=\s*(.*?)\s*$/)
      if (match) return match[1].replace(/^["']|["']$/g, '')
    }
  } catch {
    // .dev.vars is optional; fall through to the error below.
  }

  throw new Error('DATABASE_URL not set — export it or put it in .dev.vars')
}
