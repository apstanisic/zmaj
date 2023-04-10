import { isString } from "radash"
import { z } from "zod"
import { Transaction } from "../Transaction"
import { DbFieldSchema } from "@zmaj-js/common"
import { columnTypes } from "@orm/column-type"

const SharedSchema = z.object({
	schema: DbFieldSchema.optional(),
	trx: z.custom<any | Transaction>().optional(),
})
export const CreateUniqueKeySchema = SharedSchema.extend({
	tableName: DbFieldSchema,
	indexName: DbFieldSchema.nullish(),
	columnNames: z.tuple([DbFieldSchema]).rest(DbFieldSchema),
})

export const DropUniqueKeySchema = CreateUniqueKeySchema

const fkOn = ["SET NULL", "CASCADE", "SET DEFAULT", "RESTRICT", "NO ACTION"] as const

export const CreateForeignKeySchema = SharedSchema.extend({
	fkTable: DbFieldSchema,
	fkColumn: DbFieldSchema,
	referencedTable: DbFieldSchema,
	referencedColumn: DbFieldSchema,
	indexName: DbFieldSchema.nullish(),
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
	tableName: DbFieldSchema,
	pkColumn: DbFieldSchema,
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

const ZodColumnDataType = z.enum([
	// string
	"short-text",
	"long-text",
	// number
	"int",
	"float",
	// date
	"datetime",
	"date",
	"time",
	// other
	"boolean",
	"json",
	"uuid",
])
const ZodColumnType = z.enum(columnTypes)

export const CreateColumnSchema = SharedSchema.extend({
	columnName: DbFieldSchema,
	tableName: DbFieldSchema,
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
