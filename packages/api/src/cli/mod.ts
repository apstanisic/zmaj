import { createAdminCli } from "./cli-create-admin"
import { runCliMigrations } from "./run-cli-migrations"
import { uninstallZmajCli } from "./uninstall-zmaj.fn"

export const _cliUtils = {
	runMigrations: runCliMigrations,
	createAdmin: createAdminCli,
	uninstallZmaj: uninstallZmajCli,
}
