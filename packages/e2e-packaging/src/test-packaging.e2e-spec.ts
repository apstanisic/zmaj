import { ExecaChildProcess, execaCommand } from "execa"
import { readdirSync } from "node:fs"
import { join } from "node:path"
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest"
import {
	getAdminPanelResponse,
	getApiResponse,
	rootFolder,
	waitForDatabase,
	writeExampleEnvFile,
} from "./packaging-test-utils"

const dockerPull = "docker-compose --env-file .env pull"
const dockerUp = "docker-compose --env-file .env -p zmaj_example up -d"
const dockerDown = "docker-compose --env-file .env -p zmaj_example down -v"
const npmRunDev = "npm run dev"
const npmRunBuild = "npm run build"
const npmRunStart = "npm run start"

const exampleProjects = readdirSync(join(rootFolder, "examples"))

/**
 * Depends on `npx turbo build`
 */
describe.sequential.each(exampleProjects)(
	'Testing example project "%s"',
	(exampleName) => {
		const projectPath = join(rootFolder, "examples", exampleName)

		beforeAll(async () => {
			writeExampleEnvFile(projectPath)
			await execaCommand(dockerPull, { cwd: projectPath })
			await execaCommand(dockerDown, { cwd: projectPath })
		}, 30_000)

		beforeEach(async () => {
			execaCommand(dockerUp, { cwd: projectPath, extendEnv: false })
			await waitForDatabase()
		})

		afterEach(async () => {
			await execaCommand(dockerDown, { cwd: projectPath })
		})

		afterAll(async () => {
			await execaCommand(dockerDown, { cwd: projectPath })
		})

		it("docker-compose up", () => {
			expect(1).toEqual(1)
		})

		describe("npm run dev", () => {
			let app: ExecaChildProcess

			afterEach(() => {
				if (!app) return
				app.kill()
			})

			it("should get proper response from api", async () => {
				app = execaCommand(npmRunDev, {
					cwd: projectPath,
				})
				// app.stderr?.pipe(process.stdout)
				// app.stdout?.pipe(process.stdout)

				const apiResponse = await getApiResponse()
				expect(apiResponse).toEqual({ message: "API successfully reached." })
				const panelResponse = await getAdminPanelResponse()
				expect(panelResponse).toMatch(/^<!doctype html>/)
			})
		})

		describe("npm run start", () => {
			let app: ExecaChildProcess

			afterEach(() => {
				if (!app) return
				app.kill()
			})

			it("should get proper response from api", async () => {
				// If JS, there is no build step
				if (exampleName.includes("javascript")) {
					expect(1).toEqual(1)
					return
				}
				await execaCommand(npmRunBuild, { cwd: projectPath })
				app = execaCommand(npmRunStart, { cwd: projectPath })
				// app.stderr?.pipe(process.stdout)
				// app.stdout?.pipe(process.stdout)

				const apiResponse = await getApiResponse()
				expect(apiResponse).toEqual({ message: "API successfully reached." })
				const panelResponse = await getAdminPanelResponse()
				expect(panelResponse).toMatch(/^<!doctype html>/)
			})
		})
	},
	{ timeout: 200_000 },
)
