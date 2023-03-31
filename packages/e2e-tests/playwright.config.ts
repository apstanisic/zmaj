import { defineConfig, devices } from "@playwright/test"
import path, { dirname } from "path"
import { fileURLToPath } from "url"

// just src, since config is in e2e-tests
const e2ePackage = "./src"

const dir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	testDir: `${e2ePackage}/tests`,
	/* Maximum time one test can run for. */
	timeout: 30 * 1000,
	expect: {
		/**
		 * Maximum time expect() should wait for the condition to be met.
		 * For example in `await expect(locator).toHaveText();`
		 */
		timeout: 4000,
	},
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env["CI"],
	/* Retry on CI only */
	retries: process.env["CI"] ? 1 : 1,
	/* Opt out of parallel tests on CI. */
	workers: process.env["CI"] ? 1 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: "html",
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		// video: process.env["CI"] ? "retain-on-failure" : "on-first-retry",
		video: "retain-on-failure",
		/* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
		actionTimeout: 4000,
		/* Base URL to use in actions like `await page.goto('/')`. */
		baseURL: "http://localhost:7100",
		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: "retain-on-failure", // "on-first-retry",
		storageState: path.join(dir, "src/state/storage-state.json"),
		launchOptions: { slowMo: 50 },
	},
	/* Global setup */
	globalSetup: `${e2ePackage}/playwright-setup`,

	/* Configure projects for major browsers */
	projects: [
		{ name: "chromium", use: { ...devices["Desktop Chrome"] } },
		{ name: "webkit", use: { ...devices["Desktop Safari"] } },
		// Comment out until this issues are resolved
		// https://github.com/microsoft/playwright/issues/20993
		// https://github.com/microsoft/playwright/issues/21995
		// { name: "firefox", use: { ...devices["Desktop Firefox"] } },
	],

	// Limit the number of failures on CI to save resources
	maxFailures: process.env["CI"] ? 10 : undefined,
})

/**
 * Config to use to record videos for docs
 */
// const recordConfig: PlaywrightTestConfig = {
// 	...config,
// 	/* Maximum time one test can run for. Set to 10 min */
// 	timeout: 600 * 1000,
// 	use: {
// 		...config.use,
// 		// slow down, so user can see what is happening
// 		launchOptions: { ...config.use?.launchOptions, slowMo: 1000 },
// 		// record video
// 		video: { mode: "on" },
// 	},
// 	// only chromium. No need to record for all
// 	projects: [config.projects!.filter((p) => p.name === "chromium")[0]!],
// }

// const toExport = process.env["ZMAJ_RECORD_PW_DOCS"] !== "true" ? config : recordConfig

// export default toExport
