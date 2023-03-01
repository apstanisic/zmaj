import { log as pLog, spinner } from "@clack/prompts"
import { buildApi, ConfigureAppParams, predefinedApiConfigs, ZmajApplication } from "@zmaj-js/api"
import { processExit } from "./prompt-utils"

async function buildApp(customConfig?: ConfigureAppParams): Promise<ZmajApplication> {
	const api = await buildApi(
		{},
		predefinedApiConfigs.dev,
		{
			config: {
				envPath: ".env",
				throwOnNoEnvFile: true,
				useEnvFile: true,
			},
			global: { log: ["warn", "error"] },
		},
		customConfig ?? {},
	)
	return api
}

type Options = ConfigureAppParams
type Fn = (app: ZmajApplication) => unknown | Promise<unknown>
// Provides closure where user have access to app, after which, app will be closed, so
// process does not hang
export async function withApp(fn: Fn): Promise<void>
export async function withApp(options: Options, fn: Fn): Promise<void>
export async function withApp(p1: Fn | Options, p2?: Fn): Promise<void> {
	const sp = spinner()
	sp.start("Starting connection...")

	const options = typeof p1 === "function" ? {} : p1
	const fn = typeof p1 === "function" ? p1 : p2!
	let app

	try {
		app = await buildApp(options)
		sp.stop("Connection created")
	} catch (error) {
		sp.stop("Invalid connection or database in invalid state")
		processExit(1, "Please fix connection", error)
	}

	try {
		await fn(app)
	} finally {
		await app.close()
		pLog.message("Connection closed")
	}
}
