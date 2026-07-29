-include .env
export

.DEFAULT_GOAL := help

.PHONY: help install dev build preview check lint format studio deploy-studio seed set-logo

help: ## Show this help message with all available targets
	@grep -hE '^[a-zA-Z_-]+:.*?##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies for root and studio/
	yarn install
	cd studio && yarn install

dev: ## Start the Astro dev server at localhost:4321
	yarn dev

build: ## Build the production site to ./dist/
	yarn build

preview: ## Preview the production build locally
	yarn preview

# NOTE: `yarn run check`, not `yarn check` — in yarn classic, bare `yarn check`
# invokes yarn's built-in integrity command and silently skips the package script.
check: ## Run everything CI runs: types, lint, build
	yarn run check
	yarn lint
	yarn build

lint: ## Run ESLint
	yarn lint

format: ## Auto-fix lint and formatting issues
	yarn format

studio: ## Start the Sanity Studio dev server at localhost:3333
	cd studio && npx sanity dev

deploy-studio: ## Deploy Sanity Studio to *.sanity.studio hosting
	cd studio && npx sanity deploy

seed: ## Seed/refresh Sanity content from scripts/seed-data/
	yarn seed

set-logo: ## Upload an image and set it as the Sanity site logo (usage: make set-logo LOGO=path/to/file.jpg)
	yarn tsx scripts/set-logo.ts $(LOGO)
