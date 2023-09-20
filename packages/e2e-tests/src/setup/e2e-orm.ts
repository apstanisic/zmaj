import { sleep, systemModels } from "@zmaj-js/common"
import { sqOrmEngine } from "@zmaj-js/orm-sq"
import { Orm } from "zmaj"

function createOrm(): Orm {
	return new Orm({
		config: {
			database: process.env.DB_DATABASE,
			host: process.env.DB_HOST,
			password: process.env.DB_PASSWORD,
			port: Number(process.env.DB_PORT),
			username: process.env.DB_USERNAME,
			type: process.env.DB_TYPE,
		},
		engine: sqOrmEngine,
		models: [...systemModels],
	})
}

let orm: Orm
export async function getOrm(): Promise<Orm> {
	if (orm) return orm

	orm = createOrm()
	await orm.init()
	return orm
}

export async function waitForDatabase(): Promise<void> {
	const orm = createOrm()

	const success = await waitFor(async () => {
		await orm.init()
		await orm.repoManager.rawQuery("SELECT 1")
	})
	if (!success) throw new Error("Database connection not working in E2E")
}

async function waitFor(fn: () => Promise<void>): Promise<boolean> {
	const amount = 30

	for (let i = 0; i < amount; i++) {
		try {
			await fn()
			return true
		} catch (error) {
			await sleep(500)
		}
	}
	return false
}
