import { readFile, writeFile } from "fs/promises"
import pc from "picocolors"
import { processExit } from "../prompt-utils.js"
import { BaseYargs, envFilePrompt, randomString } from "../utils.js"
import { log as pLog } from "@clack/prompts"

export function generateSecretKeyCommand(yr: BaseYargs): void {
	yr.command(
		"generate-key",
		"Generate secret key",
		(y) =>
			y
				.option("env-file", {
					type: "string",
					demandOption: false,
					describe: "Path to .env file",
					alias: "e",
				})
				.option("force", {
					type: "boolean",
					alias: "f",
					demandOption: false,
					default: false,
					describe: "Overwrite current SECRET_KEY if exists.",
				}),

		async (argv) =>
			createEnvSecretKey(argv.envFile, {
				force: argv.force,
			}),
	)
}

export async function createEnvSecretKey(
	envFile?: string,
	options?: { force?: boolean },
): Promise<void> {
	const { full: filePath, raw: rawPath } = await envFilePrompt(envFile)
	const randomSecret = randomString(40)

	const file = await readFile(filePath, { encoding: "utf-8" })

	const lines = file.split("\n")
	const lineIndex = lines.findIndex((line) => line.trim().startsWith("SECRET_KEY="))

	if (lineIndex === -1) {
		lines.unshift(`SECRET_KEY=${randomSecret}`)
	} else {
		const line = lines[lineIndex]!.trim()
		const withoutKey = line.replace("SECRET_KEY", "")
		if (withoutKey === "=") {
			lines[lineIndex] = `SECRET_KEY=${randomSecret}`
			pLog.success("Created new SECRET_KEY")
		} else if (options?.force) {
			lines[lineIndex] = `SECRET_KEY=${randomSecret}`
			pLog.success("Replaced old SECRET_KEY")
		} else {
			processExit(
				0,
				pc.yellow("Secret key already exist. To replace it, run this command with --force"),
			)
		}
	}

	const changed = lines.join("\n")

	await writeFile(filePath, changed, { encoding: "utf8" })
	pLog.success(`Added SECRET_KEY to ${pc.bold(rawPath)}`)
}
