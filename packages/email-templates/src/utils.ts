import { readFileSync } from "node:fs"
import path, { dirname } from "node:path"
import { fileURLToPath } from "node:url"

export type CommonParams = { ZMAJ_APP_NAME: string }

// this will be dist folder
const currentDir = dirname(fileURLToPath(import.meta.url))

export function readTemplate(templatePath: string): string {
	const joined = path.join(currentDir, "./templates/", templatePath)
	return readFileSync(joined, { encoding: "utf-8" })
}

export function injectValues<T extends Record<string, string> = Record<string, string>>(
	template: string,
	params: T,
): string {
	let withInjectedValues = template
	for (const [key, val] of Object.entries(params)) {
		withInjectedValues = withInjectedValues.replaceAll("{" + key + "}", val)
	}
	return withInjectedValues
}
