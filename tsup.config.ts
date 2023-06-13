import { defineConfig, Options } from "tsup"

export const defaultTsupConfig: Options = {
	entry: ["src/index.ts"],
	dts: true,
	sourcemap: true,
	format: ["esm", "cjs"],
	silent: false,
	shims: true,
	outDir: "./dist",
	target: "node",

	// do not remove previous `dist`, since it messes with vscode intellisense
	// that is done on with "prebuild", only when building
	clean: false,
}

export const definedConfig = defineConfig((options) => ({ ...defaultTsupConfig, ...options }))

export default definedConfig
