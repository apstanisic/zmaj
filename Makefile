default:
	@echo "" > /dev/null

# Start docker with values for development
docker_dev_up:
	@docker-compose --env-file .env.dev -p zmaj_dev up
# Start docker with values for testing, detached
docker_test_up:
	@docker-compose --env-file .env.test -p zmaj_test up -d

# Stop dev containers. Don't remove their volumes
docker_dev_down:
	@docker-compose --env-file .env.dev -p zmaj_dev down
# Remove test container and their volumes (-v)
docker_test_down:
	@docker-compose --env-file .env.test -p zmaj_test down -v

format:
	@npm run format
lint:
	@npm run lint
tsc:
	@npm run tsc
build:
	@npm run build

serve_api:
	@pnpm --filter=@zmaj-js/api run serve
serve_admin_panel:
	@pnpm --filter=@zmaj-js/admin-panel run serve
dev_build:
	@pnpm --recursive --filter="./packages/**" --parallel run dev

test_unit:
	@npx vitest run --config vitest-unit.config.ts
test_e2e_api:
	@npx vitest run --config vitest-e2e.config.ts
test_e2e_gui:
	@npx playwright test -c packages/e2e-tests/playwright.config.ts
generate_videos:
	@npx playwright test -c packages/e2e-tests/playwright-record-examples.config.ts
test: test_unit test_api_e2e test_gui_e2e

docs:
	@pnpm --filter=@zmaj-js/docs run start
