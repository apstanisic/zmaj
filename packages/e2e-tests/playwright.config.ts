import { defineConfig, devices } from "@playwright/test"
import path, { dirname } from "path"
import { fileURLToPath } from "url"

// just src, since config is in e2e-tests
const e2ePackage = "./src"

const dir = dirname(fileURLToPath(import.meta.url))

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	testDir: `${e2ePackage}/tests`,
	/* Maximum time one test can run for. */
	timeout: 15 * 1000,
	expect: {
		/**
		 * Maximum time expect() should wait for the condition to be met.
		 * For example in `await expect(locator).toHaveText();`
		 */
		timeout: 3000,
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
		actionTimeout: 3000,
		/* Base URL to use in actions like `await page.goto('/')`. */
		baseURL: "http://localhost:7100",

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: "retain-on-failure", // "on-first-retry",
		// storageState: `${e2ePackage}/state/storage-state.json`,
		// storageState: JSON.parse(readFileSync("src/state/storage-state.json", "utf-8")),
		//"src/state/storage-state.json", //path.join(dir, ""), // `${e2ePackage}/state/storage-state.json`,
		storageState: path.join(dir, "src/state/storage-state.json"),
		// launchOptions: { slowMo: 50 },
	},
	/* Global setup */
	globalSetup: `${e2ePackage}/playwright-setup`,
	// globalTeardown: require.resolve("./packages/e2e-tests/src/setup/playwright-teardown"),

	/* Configure projects for major browsers */
	/* Maybe run all browsers only on CI, it's 3x faster to test only chromium while dev */
	projects: [
		// { name: "setup", testMatch: /.*\.setup\.ts/ },
		{ name: "chromium", use: { ...devices["Desktop Chrome"] } }, //dependencies: ["setup"] },
		{ name: "firefox", use: { ...devices["Desktop Firefox"] } }, // dependencies: ["setup"] },
		{ name: "webkit", use: { ...devices["Desktop Safari"] } }, // dependencies: ["setup"] },
	],

	/* Run your local dev server before starting the tests */
	// webServer: {
	//   command: 'npm run start',
	//   port: 3000,
	// },
	// Limit the number of failures on CI to save resources
	maxFailures: process.env["CI"] ? 5 : undefined,
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
