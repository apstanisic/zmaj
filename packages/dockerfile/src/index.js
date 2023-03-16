import { readFile } from "fs/promises"
import { runServer } from "zmaj"

/**
 * @type Parameters<typeof runServer>[0] | undefined
 */
const config = await readFile("/app/zmaj-config.json", { encoding: "utf-8" })
	.then((file) => {
		try {
			return JSON.parse(file)
		} catch (error) {
			// eslint-disable-next-line no-undef
			console.error("Config is not a valid json file")
		}
	})
	.catch((e) => {})

// Allow user to mount .env file, don't disable reading .env
await runServer({
	migrations: { autoRunMigrations: true },
	config: { envPath: "/app/.env" },
	storage: {
		providers: [{ name: "default", type: "local", basePath: "/app/files", uploadDisabled: false }],
		...config?.storage,
	},
	...config,
})
