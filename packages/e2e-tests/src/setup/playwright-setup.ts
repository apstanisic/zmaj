import { intro, outro } from "@clack/prompts"
import { FullConfig } from "@playwright/test"
import { ADMIN_ROLE_ID, UserCreateDto, merge, sleep } from "@zmaj-js/common"
import { UsersService, __testUtils, predefinedApiConfigs, runServer } from "zmaj"
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "./e2e-consts.js"
import { initTestProcessEnv, runMake } from "./e2e-env.js"
import { e2eInitAuthState } from "./e2e-init-auth-state.js"
import { waitForDatabase } from "./e2e-orm.js"
import { spinner } from "./e2e-spinner.js"

async function globalSetup(config: FullConfig): Promise<() => Promise<void>> {
	initTestProcessEnv()
	intro("Starting Playwright E2E tests")

	await spinner({
		start: "Ensure old Docker instances are down...",
		action: async () => runMake("docker_test_down"),
		end: "Old Docker instances are stopped",
	})

	await spinner({
		start: "Ensure fresh Docker...",
		action: async () => runMake("docker_test_up"),
		end: "Fresh Docker instances started",
	})

	await spinner({
		start: "Waiting for database...",
		action: async () => waitForDatabase(),
		end: "Database started",
	})

	const app = await spinner({
		start: "Starting CMS...",
		action: async () =>
			runServer(
				merge(predefinedApiConfigs.test, {
					customModules: [__testUtils.TestingUtilsModule],
					migrations: { autoRunMigrations: true },
				}),
			),

		end: "CMS started",
	})

	await spinner({
		start: "Creating admin user...",
		action: async () => {
			const userService = app.get(UsersService)
			await userService.repo.deleteWhere({ where: { email: ADMIN_EMAIL } })
			await userService.createUser({
				data: new UserCreateDto({
					confirmedEmail: true,
					email: ADMIN_EMAIL,
					password: ADMIN_PASSWORD,
					roleId: ADMIN_ROLE_ID,
					status: "active",
				}),
			})
		},
		end: "Admin user created",
	})

	await spinner({
		start: "Creating test tables...",
		action: async () => {
			const utils = app.get(__testUtils.TestingUtilsService)
			const utils2 = app.get(__testUtils.BuildTestDbService)

			await utils2.createPostsExampleTables()
			await utils.configureExampleProjectForAdminPanel()
		},
		end: "Test tables created",
	})

	await spinner({
		start: "Initializing Auth state...",
		action: async () => e2eInitAuthState(),
		end: "Auth state done",
	})

	outro("Setup Finished")

	// returned function will be called in teardown
	return async () => {
		intro("Playwright E2E teardown")

		await spinner({
			start: "Stopping CMS...",
			action: async () => {
				await Promise.race([
					app.close(), //
					sleep(8000),
				])
			},
			end: "CMS stopped",
		})

		await spinner({
			start: "Stopping Docker...",
			action: async () => runMake("docker_test_down"),
			end: "Docker stopped",
		})

		outro("Teardown finished")
	}
}

export default globalSetup
