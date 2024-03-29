import { spinner } from "@clack/prompts"
import { Orm, __testUtils, snakeCaseNaming, sqOrmEngine } from "@zmaj-js/api"
import { systemModels } from "@zmaj-js/common"
import { readFile } from "node:fs/promises"
import pc from "picocolors"
import { processExit } from "../prompt-utils.js"
import { BaseYargs, envFilePrompt } from "../utils.js"

export function createExampleSchemaCommand(yr: BaseYargs): void {
	yr.command(
		"create-example-schema",
		"Create example database schema",
		(y) =>
			y
				.option("create-data", {
					type: "boolean",
					default: false,
					alias: "d",
					description: "Should we create example data",
				})
				.option("delete-system", {
					type: "boolean",
					default: false,
					alias: "s",
					description:
						"This will delete existing system tables. This option requires -f  to work",
				})
				.option("delete-user", {
					type: "boolean",
					default: false,
					alias: "u",
					description:
						"This will delete existing user tables. This option requires -f  to work",
				})
				.option("force", {
					type: "boolean",
					default: false,
					alias: "f",
					description: "Force action",
				})
				.option("type", {
					type: "string",
					default: "blog",
					choices: ["blog", "store"] as const,
					alias: "t",
					description: "",
				})
				.option("env-file", {
					type: "string",
					demandOption: false,
					description: "Path to the env file",
				}),
		async (argv) => createExampleSchema(argv),
	)
}

async function createExampleSchema(params: {
	envFile: string | undefined
	createData: boolean
	force: boolean
	deleteUser: boolean
	deleteSystem: boolean
	type: string
}): Promise<void> {
	const { envFile, createData, force, deleteSystem, deleteUser } = params
	const { full: envPath } = await envFilePrompt(envFile)
	const type = params.type !== "blog" ? "store" : "blog"

	if (deleteUser && !force) processExit(1, "You must pass --force to delete existing tables")
	if (deleteSystem && !force) processExit(1, "You must pass --force to delete existing tables")
	// what happens with relations
	// if (deleteSystem && !deleteUser) processExit(1, "You must delete ")
	const envFileData = await readFile(envPath, { encoding: "utf-8" })

	const envValues = Object.fromEntries(
		envFileData.split("\n").map((row) => {
			const [first, ...rest] = row.split("=")
			return [first!, rest.join("=")!]
		}),
	)

	const orm = new Orm({
		engine: sqOrmEngine,
		models: [...systemModels],
		naming: snakeCaseNaming,
		config: {
			database: envValues["DB_DATABASE"]!,
			host: envValues["DB_HOST"]!,
			port: Number(envValues["DB_PORT"]!),
			username: envValues["DB_USERNAME"]!,
			password: envValues["DB_PASSWORD"]!,
			type: "postgres",
			logging: false,
		},
	})
	await orm.init()

	try {
		const service = new __testUtils.BuildTestDbService(orm.engine.engineProvider, orm)
		await service.initSqWithMocks()

		if (deleteUser) {
			const sp1 = spinner()
			sp1.start("Removing user tables")
			await service.dropAllNonSystemTables()
			sp1.stop(pc.green("User tables removed"))
		}

		if (deleteSystem) {
			const sp1 = spinner()
			sp1.start(pc.blue("Removing system tables"))
			await service.dropSystemTables()
			sp1.stop(pc.green("User system removed"))

			const sp2 = spinner()
			sp2.start(pc.blue("Creating system tables"))
			await service.createSystemTables()
			sp2.stop(pc.green("System tables created"))
		}

		const sp = spinner()
		sp.start(pc.blue("Creating example tables"))
		if (type === "blog") {
			await service.createPostsExampleTables()
		} else {
			await service.createStoreSchema()
		}
		sp.stop(pc.green("Example tables created"))

		if (createData) {
			const s3 = spinner()
			s3.start(pc.blue("Creating example data"))
			if (type === "blog") {
				await service.seedRandomData()
			} else {
				await service.seedECommerceDemo()
			}
			s3.stop(pc.green("Example data created"))
		}
		await orm.destroy()
	} catch (error) {
		await orm.destroy()
		processExit(1, "Problem creating example project", error)
	}
}
