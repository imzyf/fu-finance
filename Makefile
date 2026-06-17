# 福宝钱包 — common tasks (thin wrappers over pnpm scripts)
# Usage: `make` (shows help), `make dev`, `make test`, `make build`, ...

.DEFAULT_GOAL := help

.PHONY: help install dev build preview test test-watch typecheck clean deploy \
        db-generate db-migrate db-studio dump

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies (pnpm)
	pnpm install

dev: ## Start the Vite dev server
	pnpm dev

build: ## Type-check + production build -> dist/
	pnpm build

preview: ## Serve the production build locally
	pnpm preview

test: ## Run the unit test suite once (CI mode)
	pnpm test --run

test-watch: ## Run the unit tests in watch mode
	pnpm test

typecheck: ## Type-check only (no emit)
	pnpm typecheck

clean: ## Remove build output and installed deps
	rm -rf dist node_modules

db-generate: ## Generate versioned SQL migration from schema -> drizzle/ (commit it)
	pnpm drizzle-kit generate

db-migrate: ## Apply pending migrations to the .dev.vars / $DATABASE_URL branch
	pnpm drizzle-kit migrate

db-studio: ## Open Drizzle Studio (point-and-click editor) against that branch
	pnpm drizzle-kit studio

dump: ## Back up Neon data → snapshots/wallet.json (commit it for git history)
	pnpm tsx scripts/dump.ts

deploy: ## Build, then deploy the Worker + assets to Cloudflare (needs wrangler auth)
	pnpm build
	pnpm dlx wrangler deploy
