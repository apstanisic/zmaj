import { runSystemMigrations } from "@zmaj-js/api"
import pc from "picocolors"
import { withApp } from "../cli-app.js"
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

	await withApp({ config: { envPath: path.full } }, async (app) => {
		await runSystemMigrations(app)
		console.log(pc.green("Migration finished"))
	})
}
