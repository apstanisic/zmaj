import { FullConfig, request } from "@playwright/test"
import { merge, sleep } from "@zmaj-js/common"
import { execa } from "execa"
import { unlink } from "node:fs/promises"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import path from "path"
import { predefinedApiConfigs, runServer, __testUtils } from "zmaj"
import { testSdk } from "./utils/test-sdk.js"
// had to move here, since vitest (swc plugin for decorators) not working when root package.json has type: module.
// and playwright requires it if it's to use esm

const dir = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = path.join(dir, "../../..")
// change cwd to be root when executing command
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const make = (...params: string[]) => execa("make", [...params], { cwd: repositoryRoot })

async function globalSetup(config: FullConfig): Promise<() => Promise<void>> {
	await make("docker_test_down")
	await make("docker_test_up")

	// wait for docker to fully start
	await sleep(3000)
	console.log("\nDocker containers successfully running")

	console.log("Starting REST API and admin panel...")

	const app = await runServer(
		merge(predefinedApiConfigs.test, {
			customModules: [__testUtils.TestingUtilsModule],
			migrations: { autoRunMigrations: true },
			// changed this to point to root folder
			config: { envPath: path.join(repositoryRoot, ".env.test") },
		}),
	)

	const utils = app.get(__testUtils.TestingUtilsService)

	await utils.createTestAdmin()
	console.log("Admin user admin@example.com created")

	console.log("Creating test tables...")
	await utils.createExamplePostsProject()
	await utils.configureExampleProjectForAdminPanel()
	console.log("Test tables created")

	console.log("Signing in...")
	await testSdk.auth.signIn({ email: "admin@example.com", password: "password" })
	console.log("Sign-in success")

	const requestContext = await request.newContext({
		storageState: {
			cookies: [],
			origins: [
				{
					origin: "http://localhost:7100",
					localStorage: testSdk.auth.accessToken
						? [
								{
									name: "ZMAJ-AUTH-ADMIN_PANEL",
									value: testSdk.auth.accessToken,
								},
						  ]
						: [],
				},
			],
		},
	})

	const storagePath = path.join(dir, "./state/storage-state.json")
	await requestContext.storageState({ path: storagePath })
	await requestContext.dispose()

	console.log("Setup Finished\n")

	// returned function will be called in teardown
	return async () => {
		console.log("Teardown Started...")
		console.log("Stopping API...")
		await Promise.race([
			app.close(), //
			sleep(8000),
		])
		console.log("API stopped")
		await make("docker_test_down")

		await unlink(storagePath)
		console.log("Teardown Finished\n")
	}
}

export default globalSetup
