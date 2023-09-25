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
			"@api": resolve(__dirname, "src"),
		},
		clearMocks: true,
		globals: false,
		dangerouslyIgnoreUnhandledErrors: false,
		threads: false,
		include: ["**/*.e2e-spec.ts"],
		globalSetup: "./src/testing/vitest-e2e-setup.ts",
		logHeapUsage: true,
		// isolate: false,
		// vitest sharp problem
		// https://github.com/vitest-dev/vitest/issues/740

		// onConsoleLog: () => false,
	},
})
