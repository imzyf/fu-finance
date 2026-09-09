# 福宝钱包 — common tasks (thin wrappers over pnpm scripts)
# Usage: `make` (shows help), `make dev`, `make test`, `make build`, ...

.DEFAULT_GOAL := help

.PHONY: help dev test typecheck \
        db-generate db-migrate db-studio dump

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

dev: ## Start the Vite dev server
	pnpm dev

test: ## Run the unit test suite once (CI mode)
	pnpm test --run

typecheck: ## Type-check only (no emit)
	pnpm typecheck

db-generate: ## Generate versioned SQL migration from schema -> drizzle/ (commit it)
	pnpm db:generate

db-migrate: ## Apply pending migrations to the .dev.vars / $DATABASE_URL branch
	pnpm db:migrate

db-studio: ## Open Drizzle Studio (point-and-click editor) against that branch
	pnpm db:studio

dump: ## Back up Neon data → snapshots/wallet.json (commit it for git history)
	pnpm tsx scripts/dump.ts
