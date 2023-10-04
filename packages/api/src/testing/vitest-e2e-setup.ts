import { BuildTestDbService } from "@api/testing/build-test-db.service"
import { sleep, snakeCase, systemModels } from "@zmaj-js/common"
import { DatabaseConfig, Orm } from "@zmaj-js/orm"
import { SequelizeService, sqOrmEngine } from "@zmaj-js/orm-sq"
import { execa } from "execa"
import { join } from "node:path"
import { getTestEnvValues } from "./get-test-env-values"

const root = join(__dirname, "../../../..")

export default async function setupAndTeardown(): Promise<void | (() => Promise<void>)> {
	const env = getTestEnvValues(root)

	await execa("make", ["docker_test_down"], { cwd: root })
	await execa("make", ["docker_test_up"], { cwd: root })
	// must sleep here, otherwise it won't connect
	// I think that pg needs to setup, even tough container is running
	await sleep(3000)
	console.log("\nDocker containers successfully running")

	const config: DatabaseConfig = {
		username: env["DB_USERNAME"]!,
		password: env["DB_PASSWORD"]!,
		database: env["DB_DATABASE"]!,
		port: Number(env["DB_PORT"]),
		logging: false,
		type: (env["DB_TYPE"] as "postgres") ?? "postgres",
		host: env["DB_HOST"]!,
	}

	const orm = new Orm({
		models: [...systemModels],
		config,
		engine: sqOrmEngine,
		nameTransformer: ({ key }) => snakeCase(key),
	})
	const sq = orm.engine.engineProvider as SequelizeService

	const testData = new BuildTestDbService(sq, orm)
	await testData.initSqWithMocks()

	console.log("Removing old tables...")
	await testData.dropAllTables()
	console.log("Creating new tables...")
	await testData.createTables()
	console.log("Generating mock data...")
	await testData.seedConstData()

	console.log("Creating admin@example.com user...")
	await testData.createMockAdmin()

	return async () => {
		await sq.onModuleDestroy()
		await execa("make", ["docker_test_down"], { cwd: root })
		console.log("Docker containers successfully stopped")
	}
}
