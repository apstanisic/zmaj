import { SequelizeService } from "@api/sequelize/sequelize.service"
import { BuildTestDbService } from "@api/testing/build-test-db.service"
import { sleep } from "@zmaj-js/common"
import { execa } from "execa"
import { getTestEnvValues } from "./get-test-env-values"

export default async function setupAndTeardown(): Promise<void | (() => Promise<void>)> {
	const env = getTestEnvValues()

	await execa("make", ["docker_test_down"])
	await execa("make", ["docker_test_up"])
	// must sleep here, otherwise it won't connect
	// I think that pg needs to setup, even tough container is running
	await sleep(3000)
	console.log("\nDocker containers successfully running")

	const sq = new SequelizeService({
		username: env["DB_USERNAME"]!,
		password: env["DB_PASSWORD"]!,
		database: env["DB_DATABASE"]!,
		port: Number(env["DB_PORT"]),
		logging: false,
		type: (env["DB_TYPE"] as "postgres") ?? "postgres",
		host: env["DB_HOST"]!,
	})

	const testData = new BuildTestDbService(sq)
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
		await execa("make", ["docker_test_down"])
		console.log("Docker containers successfully stopped")
	}
}
