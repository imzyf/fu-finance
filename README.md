# 福宝钱包 · Fu Finance

一个小型全栈应用，用于记录每月的**存入明细**和**投资损益**，并通过图表与表格展示累计本金、损益和收益率。

应用以单个 **Cloudflare Worker** 运行，同时提供 React（Vite）单页应用和轻量 JSON API，数据存储在 **Neon Postgres** 数据库中。

## 技术栈

- **前端：** React 18 + Vite、Ant Design、Highcharts
- **后端：** Cloudflare Worker（`src/server/worker.ts`），提供一个接口：`GET /api/wallet`
- **数据库：** Neon Postgres，通过 Drizzle ORM（`neon-http` 驱动）访问
- **测试：** Vitest

## 工作原理

- 每月只存储三类原始数据：月份、逐笔存入明细和投资损益合计。累计本金、收益率、倍数等派生数据均由 `src/domain/compute.ts` 计算，不会写入数据库。
- `GET /api/wallet` 读取 `investments` 和 `deposits` 表，通过 `src/server/db/assembleWallet.ts` 组装数据后返回 JSON。`DATABASE_URL` 作为 Worker 密钥保存，不会暴露给浏览器。
