/// <reference types="vitest" />
import { readdirSync } from "fs"
import { join, resolve } from "path"
import { configDefaults, defineWorkspace } from "vitest/config"

// https://github.com/vitest-dev/vitest/issues/740#issuecomment-1254766751
// still only solution
try {
	require("sharp")
} catch (error) {
	//
}

const projects = readdirSync("./packages").map((folder) => ({
	test: {
		name: folder,
		include: [join("./packages", folder, "**/*.spec.{ts,js,tsx}")],
		alias: {
			"@client-sdk": resolve(__dirname, "packages/client-sdk/src"),
			"@storage-core": resolve(__dirname, "packages/storage-core/src"),
			"@storage-s3": resolve(__dirname, "packages/storage-s3/src"),
			"@common": resolve(__dirname, "packages/common/src"),
			"@api": resolve(__dirname, "packages/api/src"),
		},
		// passWithNoTests: true,
		clearMocks: true,
		exclude: [...configDefaults.exclude, "./packages/e2e-tests", "./scripts"],
		// dangerouslyIgnoreUnhandledErrors: false,
		globals: false,
		logHeapUsage: false,
	},
}))

export default defineWorkspace(projects)

// export default defineConfig({
// 	plugins: [swc.vite()],
// 	test: {
// 		alias: {
// 			"@client-sdk": resolve(__dirname, "packages/client-sdk/src"),
// 			"@storage-core": resolve(__dirname, "packages/storage-core/src"),
// 			"@storage-s3": resolve(__dirname, "packages/storage-s3/src"),
// 			"@common": resolve(__dirname, "packages/common/src"),
// 			"@api": resolve(__dirname, "packages/api/src"),
// 		},
// 		passWithNoTests: true,
// 		clearMocks: true,
// 		exclude: [...configDefaults.exclude, "./packages/e2e-tests", "./scripts"],
// 		dangerouslyIgnoreUnhandledErrors: false,
// 		globals: false,
// 		logHeapUsage: false,
// 		// singleThread: true,
// 		// include: ["./packages/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
// 	},
// })
