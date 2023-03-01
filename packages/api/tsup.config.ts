import { defineConfig } from "tsup"
import { defaultTsupConfig } from "../../tsup.config"

export default defineConfig((options) => ({
	...defaultTsupConfig,
	// main.ts is for developing, index.ts is for exporting
	entry: ["src/index.ts", "src/main.ts"],
	...options,
}))
