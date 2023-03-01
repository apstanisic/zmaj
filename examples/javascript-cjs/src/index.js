const { runServer } = require("zmaj")

async function main() {
	await runServer({
		migrations: { autoRunMigrations: true },
		config: { envPath: ".env" },
		// if you want to use custom modules or custom providers,
		// you have to compile TypeScript decorators
		customModules: [],
	})
}

main()
