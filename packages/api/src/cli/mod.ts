import { createAdminCli } from "./cli-create-admin"
import { runCliMigrations } from "./run-cli-migrations"

export const _cliUtils = {
	runMigrations: runCliMigrations,
	createAdmin: createAdminCli,
}
