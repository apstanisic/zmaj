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
} from "./alter-schema.schemas"

type Shared = { trx?: any }

export abstract class AlterSchemaService {
	abstract createTable(params: z.input<typeof CreateTableSchema>, shared?: Shared): Promise<void>

	abstract dropTable(params: z.input<typeof DropTableSchema>, shared?: Shared): Promise<void>

	abstract createColumn(params: z.input<typeof CreateColumnSchema>, shared?: Shared): Promise<void>

	abstract dropColumn(params: z.input<typeof DropColumnSchema>, shared?: Shared): Promise<void>

	abstract createFk(params: z.input<typeof CreateForeignKeySchema>, shared?: Shared): Promise<void>

	abstract dropFk(params: z.input<typeof DropForeignKeySchema>, shared?: Shared): Promise<void>

	abstract createUniqueKey(
		params: z.input<typeof CreateUniqueKeySchema>,
		shared?: Shared,
	): Promise<void>

	abstract dropUniqueKey(
		params: z.input<typeof DropUniqueKeySchema>,
		shared?: Shared,
	): Promise<void>
}
