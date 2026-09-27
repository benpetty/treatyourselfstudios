-include .env
export

.DEFAULT_GOAL := help

.PHONY: help install dev build preview check lint format studio deploy-studio seed set-logo set-hero

help: ## Show this help message with all available targets
	@grep -hE '^[a-zA-Z_-]+:.*?##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies for root and studio/
	pnpm install
	cd studio && pnpm install

dev: ## Start the Astro dev server at localhost:4321
	pnpm dev

build: ## Build the production site to ./dist/
	pnpm build

preview: ## Preview the production build locally
	pnpm preview

check: ## Run everything CI runs: types, lint, build
	pnpm check
	pnpm lint
	pnpm build

lint: ## Run ESLint
	pnpm lint

format: ## Auto-fix lint and formatting issues
	pnpm format

studio: ## Start the Sanity Studio dev server at localhost:3333
	cd studio && pnpm exec sanity dev

deploy-studio: ## Deploy Sanity Studio to *.sanity.studio hosting
	cd studio && pnpm exec sanity deploy

seed: ## Seed/refresh Sanity content from scripts/seed-data/
	pnpm seed

set-logo: ## Upload an image and set it as the Sanity site logo (usage: make set-logo LOGO=path/to/file.jpg)
	pnpm tsx scripts/set-logo.ts $(LOGO)

set-hero: ## Upload an image and set it as the homepage hero (usage: make set-hero HERO=path/to/file.jpg ALT="alt text")
	pnpm tsx scripts/set-hero.ts $(HERO) "$(ALT)"
