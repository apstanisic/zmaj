import { isCancel, log, text } from "@clack/prompts"
import { randomBytes } from "node:crypto"
import { statSync } from "node:fs"
import { stat } from "node:fs/promises"
import { join } from "node:path"
import pc from "picocolors"
import { Argv } from "yargs"
import { processExit } from "./prompt-utils"

export type BaseYargs = Argv

export function randomString(length = 20): string {
	return randomBytes(Math.ceil(length / 2))
		.toString("hex")
		.substring(0, length)
}

export async function getEnvFilePath(envFile?: string): Promise<string | void> {
	let path: string
	if (envFile !== undefined && envFile !== "") {
		const fullPath = getFullEnvPath(envFile)
		const exist = await pathExists(fullPath)
		if (!exist) {
			console.log(pc.red("ERROR: Provided env file does not exist."))
			console.log(pc.red(fullPath))
			return
		}
		path = fullPath
	} else {
		const filePath = await checkDefaultEnvLocations()
		if (!filePath) return console.log(pc.red("ERROR: There is no valid env file.\n"))
		path = filePath
	}
	return path
}

async function checkDefaultEnvLocations(): Promise<string | undefined> {
	const toCheck = [".env", ".env.dev", ".env.development"]
	for (const path of toCheck) {
		const exist = await pathExists(getFullEnvPath(path))
		if (exist) return path
	}
	return
}

async function pathExists(path: string): Promise<boolean> {
	return stat(path)
		.then((v) => v.isFile())
		.catch(() => false)
}
function getFullEnvPath(path: string): string {
	return path.startsWith("/") ? path : join(process.cwd(), path)
}

export async function envFilePrompt(envFile?: string): Promise<{ full: string; raw: string }> {
	if (typeof envFile === "string" && envFile !== "") {
		const full = getFullEnvPath(envFile)
		const valid = await pathExists(full)
		if (!valid) processExit(1, "Invalid path provided")
		return { full, raw: envFile }
	}

	const envFileInCommonPath = await checkDefaultEnvLocations()
	if (typeof envFileInCommonPath === "string") {
		log.info(
			`\nWe have found env file at ${
				getFullEnvPath(envFileInCommonPath) //
			}.\nLeave prompt empty if you want to use this file.`,
		)
	}

	const path = await text({
		message: "Enter .env file path",
		initialValue: "",
		// placeholder: "./.env",
		validate(value) {
			if ((value === "" || value === undefined) && envFileInCommonPath) return

			const file = statSync(value ?? "", { throwIfNoEntry: false })
			if (!file) return "File does not exist"
			if (!file.isFile()) return "Provided path is not a file"

			return
		},
	})
	if (isCancel(path)) processExit()

	const pathToUse = path !== "" && path !== undefined ? path : envFileInCommonPath!
	return { full: getFullEnvPath(pathToUse), raw: pathToUse }
}
