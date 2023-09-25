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
	/* Retry once both on CI and local */
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
	globalSetup: `${e2ePackage}/setup/playwright-setup`,

	/* Configure projects for major browsers */
	projects: [
		{ name: "chromium", use: { ...devices["Desktop Chrome"] } },
		// TODO Return this
		// { name: "webkit", use: { ...devices["Desktop Safari"] } },
		// Comment out until this issues are resolved
		// https://github.com/microsoft/playwright/issues/20993
		// https://github.com/microsoft/playwright/issues/21995
		// { name: "firefox", use: { ...devices["Desktop Firefox"] } },
	],

	// Limit the number of failures on CI to save resources
	maxFailures: process.env["CI"] ? 10 : undefined,
})
