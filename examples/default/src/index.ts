import { runServer } from "zmaj"
import { CatsModule } from "./cats/cats.module"

async function main() {
	await runServer({
		migrations: { autoRunMigrations: true },
		config: { envPath: ".env" },
		customModules: [CatsModule],
	})
}
main()
