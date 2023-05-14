import { z } from "zod"
import { DbColumnNameSchema } from "./db-column-name.schema"

export const ForeignKeySchema = z.object({
	fkName: DbColumnNameSchema,
	//
	fkTable: DbColumnNameSchema,
	fkColumn: DbColumnNameSchema,
	//
	referencedColumn: DbColumnNameSchema,
	referencedTable: DbColumnNameSchema,
	//
	onDelete: z.enum(["SET NULL", "SET DEFAULT", "CASCADE", "RESTRICT", "NO ACTION"]).nullable(),
	onUpdate: z.enum(["SET NULL", "SET DEFAULT", "CASCADE", "RESTRICT", "NO ACTION"]).nullable(),
	/** Is fk column unique (used to differentiate between o2o and m2o) */
	fkColumnUnique: z.boolean(),
	/** @deprecated I do not know if i need this */
	fkColumnDataType: z.string(),
})
