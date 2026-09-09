// loadWallet — 运行时获取装配完成的钱包数据。开发与生产环境使用同一路径：
// 开发环境经 @cloudflare/vite-plugin 在 workerd 中命中真实 Worker → Neon 开发分支。
// 数据库列类型和类型化 assembleWallet 已在源头保证数据形状，故前端不做运行时校验（不使用 Zod）。

import type { WalletData } from '../domain/wallet'

export async function loadWallet(): Promise<WalletData> {
  const res = await fetch('/api/wallet', { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<WalletData>
}
