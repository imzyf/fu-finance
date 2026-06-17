/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cloudflare } from '@cloudflare/vite-plugin'

// React + Cloudflare plugin: the latter reads wrangler.jsonc so `pnpm dev` runs the Worker in
// workerd (HMR + bindings preserved, dev path == prod path) and `vite build` emits client + worker.
// 在 vitest（mode === 'test'）下不加载 cloudflare()，让单测保持纯 node、不启动 workerd。
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'test' ? [] : [cloudflare()])],
  test: {
    globals: true,
    environment: 'node',
  },
}))
