import { columnDataTypes } from "@zmaj-js/common"
import { Transaction } from "@zmaj-js/orm-engine"
import { isString } from "radash"
import { z } from "zod"
import { DbColumnNameSchema } from "./db-column-name.zod"

const SharedSchema = z.object({
	schema: DbColumnNameSchema.optional(),
	trx: z.custom<any | Transaction>().optional(),
})
export const CreateUniqueKeySchema = SharedSchema.extend({
	tableName: DbColumnNameSchema,
	indexName: DbColumnNameSchema.nullish(),
	columnNames: z.tuple([DbColumnNameSchema]).rest(DbColumnNameSchema),
})

export const DropUniqueKeySchema = CreateUniqueKeySchema

const fkOn = ["SET NULL", "CASCADE", "SET DEFAULT", "RESTRICT", "NO ACTION"] as const

export const CreateForeignKeySchema = SharedSchema.extend({
	fkTable: DbColumnNameSchema,
	fkColumn: DbColumnNameSchema,
	referencedTable: DbColumnNameSchema,
	referencedColumn: DbColumnNameSchema,
	indexName: DbColumnNameSchema.nullish(),
	onDelete: z.enum(fkOn).nullable().default(null),
	onUpdate: z.enum(fkOn).nullable().default(null),
})

export const DropForeignKeySchema = CreateForeignKeySchema.pick({
	schema: true,
	trx: true,
	fkTable: true,
	fkColumn: true,
	indexName: true,
})

/**
 *
 */
export const CreateTableSchema = SharedSchema.extend({
	tableName: DbColumnNameSchema,
	pkColumn: DbColumnNameSchema,
	pkType: z.union([z.literal("uuid"), z.literal("auto-increment")]),
})

/**
 *
 */
export const DropTableSchema = CreateTableSchema.pick({
	tableName: true,
	trx: true,
	schema: true,
}).extend({
	noCascade: z.boolean().default(false),
})

const ZodColumnDataType = z.enum(columnDataTypes)

export const CreateColumnSchema = SharedSchema.extend({
	columnName: DbColumnNameSchema,
	tableName: DbColumnNameSchema,
	unique: z.boolean().default(false),
	nullable: z.boolean().default(true),
	autoIncrement: z.boolean().default(false),
	index: z.boolean().default(false),
	dataType: z
		.union([
			z.object({ value: ZodColumnDataType, type: z.literal("general") }), //
			z.object({ value: z.string(), type: z.literal("specific") }),
			ZodColumnDataType, // allows us to pass string (better dx)
		])
		.transform((value) => (isString(value) ? ({ type: "general", value } as const) : value)),

	defaultValue: z
		.union([
			z.object({ value: z.any(), type: z.literal("raw") }),
			z.object({ value: z.string(), type: z.literal("normal") }),
		])
		.nullish(),
})

/**
 *
 */
export const DropColumnSchema = CreateColumnSchema.pick({
	tableName: true,
	columnName: true,
	schema: true,
	trx: true,
})

export const UpdateColumnSchema = CreateColumnSchema.pick({
	tableName: true,
	columnName: true,
	defaultValue: true,
	trx: true,
	schema: true,
}).extend({
	nullable: z.boolean().nullish(),
	unique: z.boolean().nullish(),
})
