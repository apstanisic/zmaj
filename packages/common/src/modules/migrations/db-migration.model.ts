import { DbMigrationName } from "./migration-name.type"

export type DbMigration = {
	id: string
	name: DbMigrationName
	type: "system" | "user"
}
