import { hideBin } from "yargs/helpers"
import yargs from "yargs/yargs"
import { createAdminUserCommand } from "./commands/create-admin.js"
import { createExampleSchemaCommand } from "./commands/create-example-schema.js"
import { createMigrationCommand } from "./commands/create-migration.js"
import { createTemplateCommand } from "./commands/create-project.js"
import { generateSecretKeyCommand } from "./commands/generate-key.js"
import { runMigrationsCommand } from "./commands/migrate.js"
import { runUninstallCommand } from "./commands/uninstall.js"

export async function zmajCli(): Promise<void> {
	const y = yargs(hideBin(process.argv))
		.scriptName("npx zmaj")
		// hides --version flag
		.version(false)
		// show spell errors
		.recommendCommands()
		// throw if invalid command provided
		.strict()
		// show help if no commands is passed
		.showHelpOnFail(true)
		.demandCommand(1, "")
	//

	generateSecretKeyCommand(y)
	createAdminUserCommand(y)
	createMigrationCommand(y)
	runMigrationsCommand(y)
	createTemplateCommand(y)
	createExampleSchemaCommand(y)
	runUninstallCommand(y)
	await y.argv
}
