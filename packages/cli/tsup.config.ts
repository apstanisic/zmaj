import fse from "fs-extra"
import path from "path"
import { defineConfig } from "tsup"
import { defaultTsupConfig } from "../../tsup.config"

/**
 * Copy examples from `//examples` to `./dist/templates` so cli has direct access to them
 */
async function copyExamplesToDistFolder(): Promise<void> {
	console.log(`Copying examples`)

	const distRegex = /examples\/([A-Za-z0-9\-_]+)\/dist/

	// remove existing `templates` folder
	try {
		await fse.emptyDir("./dist/templates")
	} catch (error) {
		// throws if no folder
	}

	// copy examples to `templates` folder, but without `node_modules`, and `dist` folder
	await fse.copy("../../examples", "./dist/templates", {
		filter(src, dest) {
			if (src.includes("/node_modules")) return false
			if (src.includes(".turbo")) return false
			// do not copy `dist` folder if I accidentally build project while running examples
			if (distRegex.test(src)) return false
			return true
		},
	})

	const packageJson: Record<string, unknown> = await fse.readJson("../../package.json")
	const currentZmajVersion = String(packageJson["version"])

	// replace "workspace:*" to "latest" in package.json
	// not best practice to not specify version, but for now it's okay
	const dirs = await fse.readdir("./dist/templates")
	for (const dir of dirs) {
		const basePath = path.join("./dist/templates", dir)
		//
		const packageJsonPath = path.join(basePath, "package.json")
		const packagesJson = await fse.readFile(packageJsonPath, { encoding: "utf8" })
		// replace "workspace:*" with latest
		const changedPackageJson = packagesJson.replace(/workspace:\*/g, `^${currentZmajVersion}`)
		await fse.writeFile(packageJsonPath, changedPackageJson, { encoding: "utf8" })

		//
		// const envFilePath = path.join(basePath, ".env.dev")
		// const envFile = await fse.readFile(envFilePath, { encoding: "utf-8" })
		// // replace SECRET
		// const changedEnvFile = envFile.replace(/SECRET_KEY=[^\n]*/g, "SECRET_KEY=")
		// await fse.writeFile(envFilePath, changedEnvFile, { encoding: "utf8" })
	}
	console.log(`Finished copying examples`)
}

/**
 * Config
 */
export default defineConfig(() => ({
	...defaultTsupConfig,
	// index.ts exports function, bin.ts is cli command
	entry: ["src/index.ts", "src/bin.ts"],
	onSuccess: copyExamplesToDistFolder,
}))
