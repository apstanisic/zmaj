/// <reference types="vitest" />
import { readdirSync } from "fs"
import { join, resolve } from "path"
import swc from "unplugin-swc"
import { defineProject, defineWorkspace } from "vitest/config"

// https://github.com/vitest-dev/vitest/issues/740#issuecomment-1254766751
// still only solution
try {
	require("sharp")
} catch (error) {
	//
}

const e2eApi = defineProject({
	plugins: [swc.vite()],
	test: {
		name: "api-e2e",
		include: [join("./packages/api/**/*.e2e-spec.ts")],
		alias: {
			[`@api`]: resolve(__dirname, `packages/api/src`),
		},
		clearMocks: true,
		globals: false,
	},
})

const folders = readdirSync("./packages").filter((f) => f !== "e2e-tests")

const unitTests = folders.map((folder) =>
	defineProject({
		plugins: [swc.vite()],
		test: {
			name: folder,
			include: [join("./packages", folder, "**/*.spec.{ts,js,tsx}")],
			alias: {
				[`@${folder}`]: resolve(__dirname, `packages/${folder}/src`),
			},
			clearMocks: true,
			globals: false,
			// logHeapUsage: false,
		},
	}),
)

export default defineWorkspace([
	...unitTests,
	// e2eApi,
])
