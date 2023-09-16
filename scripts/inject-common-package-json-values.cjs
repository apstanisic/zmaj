/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */
// @ts-check

const fs = require("node:fs/promises")
const path = require("node:path")
const { readJSON, writeJSON } = require("fs-extra")

const root = path.join(__dirname, "..")

async function main() {
	/**
	 * This values must exist and can't be changed
	 */
	const requiredPackageJsonValues = {
		author: "Aleksandar Stanisic <aleksandar@tuta.io>",
		homepage: "https://github.com/apstanisic/zmaj#readme",
		license: "MIT",
		// type: "module",
		prettier: "../../.prettierrc.json",
		repository: {
			type: "git",
			url: "https://github.com/apstanisic/zmaj.git",
		},
		bugs: {
			url: "https://github.com/apstanisic/zmaj/issues",
		},
		engines: {
			node: ">=18.0.0",
		},
	}

	const rootPackageJsonPath = path.join(root, "./package.json")
	const rootPackageJson = await readJSON(rootPackageJsonPath)

	const { engines: _engines, prettier, ...forRoot } = requiredPackageJsonValues
	await writeJSON(
		rootPackageJsonPath,
		{
			...rootPackageJson,
			...forRoot,
			engines: { ..._engines, pnpm: ">=8.0.0" },
		},
		{ spaces: "\t" },
	)

	// const optionalPackageJsonValues = {
	// 	description: "Zmaj is a library to make managing your database content easier",
	// 	files: ["dist"],
	// 	type: "module",
	// }

	const projects = await fs.readdir(path.join(root, "packages"))
	for (const project of projects) {
		const packageJsonPath = path.join(root, `./packages/${project}/package.json`)

		const packageJsonString = await fs.readFile(packageJsonPath, { encoding: "utf-8" })
		const packageJson = JSON.parse(packageJsonString)

		for (const key of Object.keys(requiredPackageJsonValues)) {
			delete packageJson[key]
		}

		const joinedValues = { ...requiredPackageJsonValues, ...packageJson }
		ensureRequiredScripts(joinedValues, project)
		// indent using tabs and add new line at the end
		const joinedValuesString = JSON.stringify(joinedValues, null, "\t") + "\n"
		await fs.writeFile(packageJsonPath, joinedValuesString, { encoding: "utf-8" })
	}
}
main()

/**
 *
 * @param {any} packageJson
 * @param {string} folderName
 */
function ensureRequiredScripts(packageJson, folderName) {
	const requiredScripts = {
		prebuild: "rimraf dist",
		// lint: "eslint --fix --ext .ts,.tsx,.cts,.mts,.js,.cjs,.mjs src",
		lint: "eslint --fix src",
		test: `cd ../.. && vitest run --config vitest-unit.config.ts projects/${folderName}`,
		tsc: "tsc",
		format: "prettier . --write --ignore-unknown  --ignore-path ../../.prettierignore",
	}

	if (folderName === "docs") {
		return
	} else if (folderName === "e2e-tests") {
		packageJson["scripts"] ??= {}
		packageJson["scripts"] = {
			...packageJson["scripts"],
			lint: requiredScripts.lint,
			tsc: requiredScripts.tsc,
		}
		return
	} else {
		packageJson["scripts"] ??= {}
		packageJson["scripts"] = {
			...packageJson["scripts"],
			...requiredScripts,
		}
		return
	}
}
