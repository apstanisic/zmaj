/// <reference types="vitest" />
import { resolve } from "node:path"
import swc from "unplugin-swc"
import { defineConfig } from "vitest/config"

// Don't collapse deep object in terminal
// https://dev.to/ehlo_250/the-trick-to-making-consolelog-play-nice-with-complex-objects-gma
import { inspect } from "node:util"
inspect.defaultOptions.depth = null

// https://github.com/vitest-dev/vitest/issues/740#issuecomment-1254766751
try {
	require("sharp")
} catch (error) {
	//
}

export default defineConfig({
	plugins: [swc.vite()],
	test: {
		alias: {
			"@client-sdk": resolve(__dirname, "packages/client-sdk/src"),
			"@storage-core": resolve(__dirname, "packages/storage-core/src"),
			"@storage-s3": resolve(__dirname, "packages/storage-s3/src"),
			"@common": resolve(__dirname, "packages/common/src"),
			"@api": resolve(__dirname, "packages/api/src"),
		},
		clearMocks: true,
		globals: false,
		browser: false,
		// mockReset: true,
		// restoreMocks: true,
		dangerouslyIgnoreUnhandledErrors: false,
		threads: false,
		include: ["packages/api/**/*.e2e-spec.ts"],
		globalSetup: "./packages/api/src/testing/vitest-e2e-setup.ts",
		logHeapUsage: true,
		// isolate: false,
		// vitest sharp problem
		// https://github.com/vitest-dev/vitest/issues/740

		// onConsoleLog: () => false,
	},
})
