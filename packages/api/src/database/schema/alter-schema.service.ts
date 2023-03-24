import { z } from "zod"
import {
	CreateTableSchema,
	DropTableSchema,
	CreateColumnSchema,
	DropColumnSchema,
	CreateForeignKeySchema,
	DropForeignKeySchema,
	CreateUniqueKeySchema,
	DropUniqueKeySchema,
	UpdateColumnSchema,
} from "./alter-schema.schemas"

export abstract class AlterSchemaService {
	abstract createTable(params: z.input<typeof CreateTableSchema>): Promise<void>

	abstract dropTable(params: z.input<typeof DropTableSchema>): Promise<void>

	abstract createColumn(params: z.input<typeof CreateColumnSchema>): Promise<void>
	abstract updateColumn(params: z.input<typeof UpdateColumnSchema>): Promise<void>

	abstract dropColumn(params: z.input<typeof DropColumnSchema>): Promise<void>

	abstract createFk(params: z.input<typeof CreateForeignKeySchema>): Promise<void>

	abstract dropFk(params: z.input<typeof DropForeignKeySchema>): Promise<void>

	abstract createUniqueKey(params: z.input<typeof CreateUniqueKeySchema>): Promise<void>

	abstract dropUniqueKey(params: z.input<typeof DropUniqueKeySchema>): Promise<void>
}
