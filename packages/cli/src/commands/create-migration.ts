import { isCancel, outro, select, text } from "@clack/prompts"
import { MigrationNameSchema } from "@zmaj-js/common"
import fse from "fs-extra"
import path from "path"
import pc from "picocolors"
import { processExit } from "../prompt-utils.js"
import { BaseYargs } from "../utils.js"

export function createMigrationCommand(yr: BaseYargs): void {
	yr.command(
		"create-migration [migration-name]",
		"Create Migration",
		(y) =>
			y
				.positional("migrationName", {
					type: "string",
					description: "Migration name. Without extension",
					demandOption: false,
				})
				.option("type", {
					type: "string",
					demandOption: false,
					choices: ["cjs", "esm"] as const,
					description: "Is project CommonJS or ES Module",
				})
				.option("path", {
					type: "string",
					demandOption: false,
					description: "Folder where to save migration",
				}),
		async (argv) => createMigration(argv),
	)
}

async function createMigration({
	migrationName,
	folder,
	type,
}: {
	migrationName?: string
	folder?: string
	type?: "cjs" | "esm"
}): Promise<void> {
	console.log(pc.blue("Creating migration..."))

	let dateAndName: string
	let projectType: "esm" | "cjs"
	let folderPath: string

	if (migrationName && migrationName.trim().length > 1) {
		const name = migrationName.trim().replace(/[\W]/g, "_")
		const parsed = MigrationNameSchema.safeParse(name)
		if (!parsed.success) {
			processExit(1, "Invalid migration name")
		} else {
			dateAndName = parsed.data
		}
	} else {
		const name = await text({
			message: "Enter migration name",
			// placeholder: "my-migration",
			validate(value) {
				if (value.trim().length === 0) return "You must provide a name"
				return
			},
		})
		if (isCancel(name)) processExit()
		dateAndName = MigrationNameSchema.parse(name.replace(/[\W]/g, "_"))
	}
	if (type) {
		projectType = type
	} else {
		const type = await select({
			message: "Is your project CJS or ESM",
			options: [{ value: "esm" }, { value: "cjs" }],
			initialValue: "esm",
		})

		if (isCancel(type)) processExit()
		projectType = type as "cjs" | "esm"
	}

	if (folder) {
		folderPath = folder
	} else {
		const folder = await text({
			message: "Enter in which folder you want to save migration",
			placeholder: ".",
		})

		if (isCancel(folder)) processExit()
		folderPath = folder
	}

	// todo add .ts
	const filePath = path.join(folderPath, `${dateAndName}.js`)
	await fse.writeFile(filePath, migrationContent(dateAndName, projectType))
	outro("Migration created at " + pc.bold(filePath))
}

const migrationContent = (name: string, type: "cjs" | "esm"): string => {
	const text = getMigrationCodeText(name)
	const exportStatement =
		type === "cjs"
			? "module.exports = { name, up, down };" //
			: "export { name, up, down };"

	return `${text}\n\n${exportStatement}\n`
}

const getMigrationCodeText = (name: string): string =>
	`
/**
 * Migration name
 */
const name = "${name}";
/**
 * Up migration
 *
 * @param {(query: string) => Promise<void>} execute - Function that will execute your query in transaction
 * @returns {Promise<void>}
 */
export async function up(execute) {
	// await execute("CREATE TABLE my_super_table (id SERIAL PRIMARY KEY, name TEXT)")
}

/**
 * Down migration
 *
 * @param {(query: string) => Promise<void>} execute - Function that will execute your query in transaction
 * @returns {Promise<void>}
 */
export async function down(execute) {
	// await execute("DROP TABLE my_super_table IF EXISTS")
}
`.trim()
