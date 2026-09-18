# 福宝钱包 · Fu Finance

一个记录每月**存入明细**和**投资损益**的小型全栈应用，通过 KPI、图表和明细表展示累计本金、损益、收益率，以及与定存收益的对比。

应用以单个 Cloudflare Worker 运行，同时提供 React 单页应用和 JSON API；数据存储在 Neon Postgres 中。

## 功能

- 展示总金额、累计本金、投资损益、损益率和本金加权年化收益率。
- 按月展示投资损益、存入记录和资产变化。
- 将实际投资表现与 1.4% 定存及 3.3%–5% 目标区间对比。
- 从 Neon 读取原始记录，并将所有累计值和指标在应用内派生计算。

## 技术栈

- **前端：** React 19、Vite、Ant Design、Highcharts
- **运行时：** Cloudflare Workers + Static Assets
- **数据库：** Neon Postgres、Drizzle ORM、`neon-http`
- **测试：** Vitest

## 工作原理

- 数据库只保存逐笔的投资损益和存入记录；同月的多笔投资损益由 `src/server/db/assembleWallet.ts` 汇总。累计本金、收益率、倍数等派生数据均由 `src/domain/compute.ts` 计算，不会写入数据库。
- `GET /api/wallet` 读取 `investments` 和 `deposits` 表，通过 `src/server/db/assembleWallet.ts` 组装数据后返回 JSON。`DATABASE_URL` 作为 Worker 密钥保存，不会暴露给浏览器。
- Cloudflare Vite 插件在开发环境中同时运行前端和 Worker；生产构建则将两者输出到 `dist/`。

## 本地开发

项目 CI 使用 Node.js 24，包管理器版本由 `package.json` 中的 `packageManager` 字段固定。

1. 安装依赖：

   ```bash
   pnpm install
   ```

2. 创建本地 Worker 环境文件：

   ```bash
   cp .dev.vars.example .dev.vars
   ```

   将 `.dev.vars` 中的 `DATABASE_URL` 设为 Neon **dev branch** 的 Postgres 连接串。该文件已被 Git 忽略，不应提交。

3. 应用未执行的数据库迁移：

   ```bash
   pnpm db:migrate
   ```

4. 启动开发服务器：

   ```bash
   pnpm dev
   ```

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 启动带 HMR 的前端和本地 Worker |
| `pnpm test --run` | 运行一次单元测试 |
| `pnpm typecheck` | 执行 TypeScript 类型检查 |
| `pnpm build` | 构建前端、Worker 和部署配置 |
| `pnpm preview` | 本地预览生产构建 |
| `pnpm db:generate` | 根据 Drizzle schema 生成版本化 SQL 迁移 |
| `pnpm db:migrate` | 对 `DATABASE_URL` 指向的数据库应用迁移 |
| `pnpm db:studio` | 使用 Drizzle Studio 管理当前数据库 |
| `make dump` | 将原始数据导出到 `snapshots/wallet.json` |

`Makefile` 也为开发、测试、类型检查和数据库命令提供了同名的简短入口；运行 `make` 可查看帮助。

## 数据与迁移

- Drizzle schema 位于 `src/server/db/schema.ts`，版本化 SQL 迁移位于 `drizzle/`。
- `scripts/env.ts` 优先读取进程环境中的 `DATABASE_URL`，否则从 `.dev.vars` 读取。
- `make dump` 按 `date` 和 `id` 稳定排序后覆盖 `snapshots/wallet.json`，不写入时间戳。数据未变时文件保持不变，便于用 Git diff 审查和保留历史。

## 部署

推送到 `main` 后，GitHub Actions 会依次执行冻结锁文件安装、单元测试和构建，然后将 `dist/fu_finance/wrangler.json` 描述的 Worker 与静态资源部署到 Cloudflare。

部署工作流从 GitHub `prod` Environment 读取 `CLOUDFLARE_API_PAGES_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID`；生产 Worker 还需要预先配置 `DATABASE_URL` 密钥。CI 不持有数据库凭据，也不会在部署时执行数据库迁移。
