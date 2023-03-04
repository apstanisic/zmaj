import { outro, spinner } from "@clack/prompts"
import { _cliUtils } from "@zmaj-js/api"
import { processExit } from "../prompt-utils.js"
import { BaseYargs, envFilePrompt } from "../utils.js"

export function runMigrationsCommand(yr: BaseYargs): void {
	yr.command(
		"migrate",
		"Run migrations",
		(y) => y.option("env-file", { type: "string" }),
		async (argv) => runMigrations(argv.envFile),
	)
}

async function runMigrations(envFile?: string): Promise<void> {
	const path = await envFilePrompt(envFile)

	const sp = spinner()

	sp.start("Starting migrations")
	await _cliUtils.runMigrations(path.full).catch((e) => {
		sp.stop("Problem with migrations")
		console.error(e)

		processExit(1, "Problem executing migrations")
	})
	sp.stop("Migrations executed")
	outro("All done!")
}
