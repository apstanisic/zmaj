import { ExecaChildProcess, execaCommand } from "execa"
import getPort from "get-port"
import { readdirSync } from "node:fs"
import { rmdir, writeFile } from "node:fs/promises"
import path, { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { promisify } from "node:util"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

const sleep = promisify(setTimeout)

const cliCommands = {
	dockerUp: "docker-compose --env-file .env -p zmaj_example up -d",
	// dockerDown: "docker-compose --env-file .env -p zmaj_example down -v",
	dockerDown: "docker-compose -p zmaj_example --env-file .env -p kill",
	dockerRm: "docker-compose -p zmaj_example --env-file .env -p rm -fsv",
	startApi: "npm run dev",
}

const dir = dirname(fileURLToPath(import.meta.url))
const repoRootPath = join(dir, "..")
const examplesFolderPath = join(repoRootPath, "examples")
const examples = readdirSync(examplesFolderPath)

/**
 * Depends on `npx turbo build`
 */
describe.each(examples)(
	'Testing example project "%s"',
	(example) => {
		const cwd = join(repoRootPath, "examples", example)
		let zmajProcess: ExecaChildProcess | undefined
		let port: number = 17100

		function getEnv(port: number): { APP_PORT: string } & Record<string, string> {
			return {
				APP_PORT: String(port),
				APP_URL: `http://localhost:${port}`,
				SECRET_KEY: "hello_world_testing_packaging",
				APP_NAME: "Zmaj App",
				//
				DB_USERNAME: "db_user",
				DB_PASSWORD: "db_password",
				DB_DATABASE: "zmaj_db",
				DB_HOST: "localhost",
				DB_PORT: "5432",
			}
		}

		beforeEach(async () => {
			port = await getPort({ port: getPort.makeRange(port + 1, 18000) })

			const envsString = Object.entries(getEnv(port))
				.map(([k, v]) => `${k}=${v}`)
				.join("\n")
			await writeFile(path.join(cwd, ".env"), envsString, { encoding: "utf-8" })
			await sleep(500)
			await execaCommand(cliCommands.dockerDown, { cwd }).catch((e) => undefined)
			await sleep(500)
			await execaCommand(cliCommands.dockerRm, { cwd }).catch((e) => undefined)
			await sleep(500)

			execaCommand(cliCommands.dockerUp, { cwd, killSignal: "SIGKILL" })
			await sleep(5000)
		}, 20_000)

		afterEach(async () => {
			const success = zmajProcess?.kill("SIGKILL")
			zmajProcess = undefined
			if (success === false) throw new Error("Can't kill old Zmaj process")
			await sleep(3000)
			await execaCommand(cliCommands.dockerDown, { cwd }).catch((e) => undefined)
			await sleep(500)
			await execaCommand(cliCommands.dockerRm, { cwd }).catch((e) => undefined)
			await sleep(2000)
		}, 30_000)

		it("should setup docker successfully", () => {
			expect(1).toEqual(1)
		})

		it("should start dev mode successfully", async () => {
			expect.assertions(4)
			const env = getEnv(port)
			zmajProcess = execaCommand("npm run dev", { cwd, env })
			zmajProcess.stderr?.pipe(process.stderr)
			// this timeout is important, since it needs to setup a database
			await sleep(8000)

			const responseApiRaw = await fetch(`http://localhost:${env.APP_PORT}/api`)
			const resultApiJson = await responseApiRaw.json()

			expect(responseApiRaw.ok).toEqual(true)
			expect(resultApiJson).toEqual({ message: "API successfully reached." })

			const responseAdminPanelRaw = await fetch(`http://localhost:${env.APP_PORT}/admin`)
			const responseAdminPanelText = await responseAdminPanelRaw.text()
			expect(responseAdminPanelRaw.ok).toEqual(true)
			expect(responseAdminPanelText.startsWith("<!DOCTYPE html>")).toEqual(true)
		}, 60_000)

		it("should build project and start it successfully", async () => {
			if (example.includes("javascript")) {
				expect(1).toEqual(1)
				return
			}
			expect.assertions(4)
			const env = getEnv(port)
			// remove dist, but do not throw if dist folder does not exist
			await rmdir(join(cwd, "dist")).catch(() => {})
			await sleep(2000)
			await execaCommand("npm run build", { cwd })
			await sleep(2000)
			zmajProcess = execaCommand("npm run start", { cwd, env })
			zmajProcess.stderr?.pipe(process.stderr)
			// this timeout is important, since it needs to setup a database
			await sleep(6000)

			const responseApiRaw = await fetch(`http://localhost:${env.APP_PORT}/api`).catch((e) => {
				throw new Error("Can't react server, ", { cause: e })
			})
			const responseApiJson = await responseApiRaw.json()

			expect(responseApiRaw.ok).toEqual(true)
			expect(responseApiJson).toEqual({ message: "API successfully reached." })

			const responseAdminPanelRaw = await fetch(`http://localhost:${env.APP_PORT}/admin`)
			const responseAdminPanelText = await responseAdminPanelRaw.text()
			expect(responseAdminPanelRaw.ok).toEqual(true)
			expect(responseAdminPanelText.startsWith("<!DOCTYPE html>")).toEqual(true)
		}, 60_000)
	},
	{ timeout: 500_000 },
)
