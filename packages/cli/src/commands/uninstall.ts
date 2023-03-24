import { confirm, isCancel, outro, spinner } from "@clack/prompts"
import { _cliUtils } from "@zmaj-js/api"
import { processExit } from "../prompt-utils.js"
import { BaseYargs, envFilePrompt } from "../utils.js"

export function runUninstallCommand(yr: BaseYargs): void {
	yr.command(
		"uninstall",
		"Uninstall Zmaj (uploaded files will not be deleted)",
		(y) =>
			y.option("env-file", { type: "string" }).option("force", {
				alias: "f",
				type: "boolean",
				description: "Do not ask for confirmation",
			}),
		async (argv) => uninstall(argv.envFile, argv.force),
	)
}

async function uninstall(envFile?: string, force?: boolean): Promise<void> {
	const path = await envFilePrompt(envFile)

	if (force !== true) {
		const confirmed = await confirm({ message: "Are you sure?", initialValue: false })
		if (isCancel(confirm)) processExit()
		if (!confirmed) processExit()
	}
	const sp = spinner()

	sp.start("Removing Zmaj tables")
	await _cliUtils.uninstallZmaj(path.full).catch((e) => {
		sp.stop("Problem deleting tables")
		console.error(e)

		processExit(1, "Problem uninstalling Zmaj")
	})
	sp.stop("Removed Zmaj tables")
	outro("All done!")
}
