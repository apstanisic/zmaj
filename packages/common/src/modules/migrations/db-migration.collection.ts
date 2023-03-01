import { DefineCollection } from "@common/collection-builder/define-collection"
import { forbiddenKey } from "../permissions"
import { DbMigration } from "./db-migration.model"

/**
 * Migrations
 */
export const DbMigrationCollection = DefineCollection<DbMigration>({
	tableName: "zmaj_migrations",
	options: { authzKey: forbiddenKey },
	fields: {
		id: { dataType: "uuid", isPrimaryKey: true, columnName: "id", canUpdate: false },
		name: { dataType: "short-text", canUpdate: false },
		type: { dataType: "short-text", canUpdate: false },
	},
	relations: {},
})
