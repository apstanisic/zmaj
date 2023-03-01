import { ModelSchema } from "@common/zod"
import { v4 } from "uuid"
import { z } from "zod"
import { DbMigration } from "./db-migration.model"
import { MigrationNameSchema } from "./migration-name.schema"

export const DbMigrationSchema = ModelSchema<DbMigration>()(
	z.object({
		id: z.string().uuid().default(v4),
		name: MigrationNameSchema,
		type: z.enum(["system", "user"]).default("user"),
	}),
)
