// loadWallet — runtime fetch of the assembled wallet. dev/prod 同路径：
// dev 经 @cloudflare/vite-plugin 在 workerd 命中真实 Worker → Neon dev branch。
// DB 列类型 + 类型化 assembleWallet 已在源头保证形状，故前端不做运行时校验（不 zod）。

import type { WalletData } from '../domain/wallet'

export async function loadWallet(): Promise<WalletData> {
  const res = await fetch('/api/wallet', { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<WalletData>
}
