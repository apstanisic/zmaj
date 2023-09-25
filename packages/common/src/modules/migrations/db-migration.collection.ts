import { codeCollection } from "@common/collection-builder/define-collection"
import { forbiddenKey } from "../permissions"
import { DbMigrationModel } from "./db-migration.model"

/**
 * Migrations
 */
export const DbMigrationCollection = codeCollection(DbMigrationModel, {
	options: { authzKey: forbiddenKey },
	relations: {},
})
