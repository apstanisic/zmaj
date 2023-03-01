import { ExecaChildProcess, execaCommand } from "execa"
import killPort from "kill-port"
import { readdirSync } from "node:fs"
import { rmdir } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { promisify } from "node:util"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

const sleep = promisify(setTimeout)

const cliCommands = {
	dockerUp: "docker-compose --env-file .env.dev -p zmaj_example up -d",
	dockerDown: "docker-compose --env-file .env.dev -p zmaj_example down -v",
	startApi: "npm run dev",
}

const dir = dirname(fileURLToPath(import.meta.url))
const repoRootPath = join(dir, "..")
const examplesFolderPath = join(repoRootPath, "examples")
const examples = readdirSync(examplesFolderPath)

let _port = 15540

describe.each(examples)(
	'Testing example project "%s"',
	(example) => {
		const cwd = join(repoRootPath, "examples", example)
		const runningProcesses: ExecaChildProcess[] = []

		async function getEnv(): Promise<{ APP_PORT: string; SECRET_KEY: string }> {
			_port += 1
			// ignore error if no process is running
			await killPort(_port).catch(() => {})
			return {
				APP_PORT: String(_port),
				SECRET_KEY: "hello_world_testing_packaging",
			}
		}

		beforeAll(async () => {
			await execaCommand(cliCommands.dockerDown, { cwd })
			await execaCommand(cliCommands.dockerUp, { cwd })
			await sleep(3000)
		}, 30_000)

		afterAll(async () => {
			for (const pr of runningProcesses) {
				pr.kill("SIGTERM", { forceKillAfterTimeout: 2000 })
			}
			await sleep(2500)

			await execaCommand(cliCommands.dockerDown, { cwd })
			await sleep(2000)
		}, 30_000)

		it("should setup docker successfully", () => {
			expect(1).toEqual(1)
		})

		it("should start dev mode successfully", async () => {
			expect.assertions(2)
			const env = await getEnv()
			// console.log("Starting server...")
			const dev = execaCommand("npm run dev", { cwd, env })
			runningProcesses.push(dev)
			dev.stderr?.pipe(process.stderr)
			await sleep(5000)

			const result = await fetch(`http://localhost:${env.APP_PORT}/api`).then((r) => r.json())
			expect(result).toEqual({ message: "API successfully reached." })
			const resultHtml = await fetch(`http://localhost:${env.APP_PORT}/admin`).then((r) => r.text())
			expect(resultHtml.startsWith("<!DOCTYPE html>")).toEqual(true)
		}, 60_000)

		it.skipIf(example.includes("javascript"))(
			"should build project and start it successfully",
			async () => {
				expect.assertions(2)
				const env = await getEnv()
				// do not throw if dist folder does not exist
				await rmdir(join(cwd, "dist")).catch(() => {})
				await execaCommand("npm run build", { cwd })
				const start = execaCommand("npm run start", { cwd, env })
				runningProcesses.push(start)
				start.stderr?.pipe(process.stderr)
				await sleep(3000)

				const result = await fetch(`http://localhost:${env.APP_PORT}/api`).then((r) => r.json())
				expect(result).toEqual({ message: "API successfully reached." })
				const resultHtml = await fetch(`http://localhost:${env.APP_PORT}/admin`).then((r) =>
					r.text(),
				)
				expect(resultHtml.startsWith("<!DOCTYPE html>")).toEqual(true)
			},
			60_000,
		)
	},
	{ timeout: 500_000 },
)
