import { DbFieldSchema } from "@common/zod/zod-utils"
import { z } from "zod"

export const ForeignKeySchema = z.object({
	fkName: DbFieldSchema,
	//
	fkTable: DbFieldSchema,
	fkColumn: DbFieldSchema,
	//
	referencedColumn: DbFieldSchema,
	referencedTable: DbFieldSchema,
	//
	onDelete: z.enum(["SET NULL", "SET DEFAULT", "CASCADE", "RESTRICT", "NO ACTION"]).nullable(),
	onUpdate: z.enum(["SET NULL", "SET DEFAULT", "CASCADE", "RESTRICT", "NO ACTION"]).nullable(),
	/** Is fk column unique (used to differentiate between o2o and m2o) */
	fkColumnUnique: z.boolean(),
	/** @deprecated I do not know if i need this */
	fkColumnDataType: z.string(),
})
