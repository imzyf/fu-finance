# 福宝钱包 · Fu Finance

A small full-stack app to track monthly **cash-in (deposits)** and **investment income**, then show cumulative principal, returns, and rates as charts and tables.

It runs as a single **Cloudflare Worker** that serves a React (Vite) SPA and a tiny JSON API backed by a **Neon Postgres** database.

## Tech stack

- **Frontend:** React 18 + Vite, Ant Design, Highcharts
- **Backend:** Cloudflare Worker (`src/worker.ts`), one endpoint: `GET /api/wallet`
- **Database:** Neon Postgres via Drizzle ORM (`neon-http` driver)
- **Tests:** Vitest

## How it works

- Only three raw facts are stored per month: the month, itemized deposits, and the aggregate investment income. Every derived number (cumulative principal, rates, multiple) is computed in `src/compute.ts` — never stored.
- `GET /api/wallet` reads the `investments` and `deposits` tables, assembles them (`src/db/assembleWallet.ts`), and returns JSON. `DATABASE_URL` is a Worker secret; the browser never sees it.
