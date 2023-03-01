import { runServer } from "zmaj"

// Allow user to mount .env file, don't disable reading .env
await runServer({ migrations: { autoRunMigrations: true } })
