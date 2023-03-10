import { DbFieldSchema } from "@zmaj-js/common"
import { isString } from "radash"
import { z } from "zod"

export const CreateUniqueKeySchema = z.object({
	tableName: DbFieldSchema,
	indexName: DbFieldSchema.nullish(),
	columnNames: z.tuple([DbFieldSchema]).rest(DbFieldSchema),
})

export const DropUniqueKeySchema = CreateUniqueKeySchema

const fkOn = ["SET NULL", "CASCADE", "SET DEFAULT", "RESTRICT", "NO ACTION"] as const

export const CreateForeignKeySchema = z.object({
	fkTable: DbFieldSchema,
	fkColumn: DbFieldSchema,
	referencedTable: DbFieldSchema,
	referencedColumn: DbFieldSchema,
	indexName: DbFieldSchema.nullish(),
	onDelete: z.enum(fkOn).nullable().default(null),
	onUpdate: z.enum(fkOn).nullable().default(null),
})

export const DropForeignKeySchema = CreateForeignKeySchema.pick({
	fkTable: true,
	fkColumn: true,
	indexName: true,
})

/**
 *
 */
export const CreateTableSchema = z.object({
	tableName: DbFieldSchema,
	pkColumn: DbFieldSchema,
	pkType: z.union([z.literal("uuid"), z.literal("auto-increment")]),
})

/**
 *
 */
export const DropTableSchema = CreateTableSchema.pick({ tableName: true })

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

export const CreateColumnSchema = z.object({
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
export const DropColumnSchema = CreateColumnSchema.pick({ tableName: true, columnName: true })
