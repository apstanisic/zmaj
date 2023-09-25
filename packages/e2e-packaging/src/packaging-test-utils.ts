import { Orm } from "@zmaj-js/orm"
import { sqOrmEngine } from "@zmaj-js/orm-sq"
import axios from "axios"
import { writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { promisify } from "node:util"

export const rootFolder = join(dirname(fileURLToPath(import.meta.url)), "../../..")
const PORT = 17100
const APP_URL = `http://localhost:${PORT}`

/**
 * This is using info that is provided in `docker-compose` in example project
 */
const env = {
	APP_PORT: PORT.toString(),
	APP_URL: APP_URL,
	SECRET_KEY: "hello_world_testing_packaging",
	APP_NAME: "Zmaj App",
	//
	DB_USERNAME: "db_user",
	DB_PASSWORD: "db_password",
	DB_DATABASE: "zmaj_db",
	DB_HOST: "localhost",
	DB_PORT: "5432",
}

const serializedEnv = Object.entries(env)
	.filter(([k, v]) => ![null, undefined, ""].includes(v))
	.map(([k, v]) => `${k}=${v}`)
	.join("\n")

export const sleep = promisify(setTimeout)

async function waitFor(fn: () => Promise<void>): Promise<boolean> {
	const amount = 10

	for (let i = 0; i < amount; i++) {
		try {
			await fn()
			return true
		} catch (error) {
			await sleep(1000)
		}
	}
	return false
}

export async function getApiResponse(): Promise<unknown> {
	let response: unknown
	await waitFor(async () => {
		const url = `${APP_URL}/api`
		const res = await axios.get(url)
		response = res.data
	})
	return response
}

export async function getAdminPanelResponse(): Promise<unknown> {
	let response: unknown
	await waitFor(async () => {
		const url = `${APP_URL}/admin`
		const res = await axios.get(url)
		response = res.data
	})
	return response
}

export async function waitForDatabase(): Promise<void> {
	const success = await waitFor(async () => {
		const orm = new Orm({
			models: [],
			engine: sqOrmEngine,
			config: {
				database: env.DB_DATABASE,
				host: env.DB_HOST,
				password: env.DB_PASSWORD,
				port: Number(env.DB_PORT),
				username: env.DB_USERNAME,
				type: "postgres",
			},
		})
		await orm.init()
		await orm.repoManager.rawQuery("SELECT 1")
		await orm.destroy()
	})
	if (!success) throw new Error("DB not starting")
}

export function writeExampleEnvFile(folder: string): void {
	writeFileSync(join(folder, ".env"), serializedEnv, { encoding: "utf-8" })
}
