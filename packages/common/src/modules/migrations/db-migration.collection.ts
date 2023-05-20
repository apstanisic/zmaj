import { defineCollection } from "@common/collection-builder/define-collection"
import { forbiddenKey } from "../permissions"
import { DbMigrationModel } from "./db-migration.model"

/**
 * Migrations
 */
export const DbMigrationCollection = defineCollection(DbMigrationModel, {
	options: { authzKey: forbiddenKey },
})
