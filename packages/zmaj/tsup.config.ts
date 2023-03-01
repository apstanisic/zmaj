import { defineConfig } from "tsup"
import { defaultTsupConfig } from "../../tsup.config"

export default defineConfig(() => ({
	...defaultTsupConfig,
	// index.ts is for usage with libraries, bin.ts is cli for generating projects...
	entry: ["src/index.ts", "src/bin.ts"],
}))
