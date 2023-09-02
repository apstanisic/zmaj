import { Transaction } from "@orm-engine/repo/transaction.type"
import { ColumnType } from "./column-types"

type SharedParams = {
	schema?: string
	trx?: Transaction
}

// const SharedSchema = z.object({
// 	schema: DbColumnNameSchema.optional(),
// 	trx: z.custom<any | Transaction>().optional(),
// })
export type CreateUniqueKeyParams = SharedParams & {
	tableName: string
	columnNames: [string, ...string[]]
	indexName?: string | null
}
// export const CreateUniqueKeySchema = SharedSchema.extend({
// 	tableName: DbColumnNameSchema,
// 	indexName: DbColumnNameSchema.nullish(),
// 	columnNames: z.tuple([DbColumnNameSchema]).rest(DbColumnNameSchema),
// })
export type DropUniqueKeyParams = CreateUniqueKeyParams

// export const DropUniqueKeySchema = CreateUniqueKeySchema

const fkOn = ["SET NULL", "CASCADE", "SET DEFAULT", "RESTRICT", "NO ACTION"] as const

type FkOn = (typeof fkOn)[number]

export type CreateForeignKeyParams = SharedParams & {
	fkTable: string
	fkColumn: string
	referencedTable: string
	referencedColumn: string
	indexName?: string | null
	onDelete?: FkOn | null
	onUpdate?: FkOn | null
}

// export const CreateForeignKeySchema = SharedSchema.extend({
// 	fkTable: DbColumnNameSchema,
// 	fkColumn: DbColumnNameSchema,
// 	referencedTable: DbColumnNameSchema,
// 	referencedColumn: DbColumnNameSchema,
// 	indexName: DbColumnNameSchema.nullish(),
// 	onDelete: z.enum(fkOn).nullable().default(null),
// 	onUpdate: z.enum(fkOn).nullable().default(null),
// })

export type DropForeignKeyParams = Pick<
	CreateForeignKeyParams,
	"schema" | "trx" | "fkTable" | "fkColumn" | "indexName"
>

// export const DropForeignKeySchema = CreateForeignKeySchema.pick({
// 	schema: true,
// 	trx: true,
// 	fkTable: true,
// 	fkColumn: true,
// 	indexName: true,
// })

export type CreateTableParams = SharedParams & {
	tableName: string
	pkColumn: string
	pkType: "uuid" | "auto-increment"
}

/**
 *
 */
// export const CreateTableSchema = SharedSchema.extend({
// 	tableName: DbColumnNameSchema,
// 	pkColumn: DbColumnNameSchema,
// 	pkType: z.union([z.literal("uuid"), z.literal("auto-increment")]),
// })

export type DropTableParams = SharedParams & { tableName: string; noCascade?: boolean }

/**
 *
 */
// export const DropTableSchema = CreateTableSchema.pick({
// 	tableName: true,
// 	trx: true,
// 	schema: true,
// }).extend({
// 	noCascade: z.boolean().default(false),
// })

// const ZodColumnDataType = z.enum([
// 	// string
// 	"short-text",
// 	"long-text",
// 	// number
// 	"int",
// 	"float",
// 	// date
// 	"datetime",
// 	"date",
// 	"time",
// 	// other
// 	"boolean",
// 	"json",
// 	"uuid",
// ])
// const ZodColumnType = z.enum(columnTypes)

type DefaultValueType = { type: "raw"; value: string } | { type: "normal"; value: string }

export type CreateColumnParams = SharedParams & {
	columnName: string
	tableName: string
	unique?: boolean
	nullable?: boolean
	autoIncrement?: boolean
	index?: boolean
	dataType: { type: "general"; value: ColumnType } | { type: "specific"; value: string }
	defaultValue?: DefaultValueType
}

// export const CreateColumnSchema = SharedSchema.extend({
// 	columnName: DbColumnNameSchema,
// 	tableName: DbColumnNameSchema,
// 	unique: z.boolean().default(false),
// 	nullable: z.boolean().default(true),
// 	autoIncrement: z.boolean().default(false),
// 	index: z.boolean().default(false),
// 	dataType: z
// 		.union([
// 			z.object({ value: ZodColumnDataType, type: z.literal("general") }), //
// 			z.object({ value: z.string(), type: z.literal("specific") }),
// 			ZodColumnDataType, // allows us to pass string (better dx)
// 		])
// 		.transform((value) =>
// 			typeof value === "string" ? ({ type: "general", value } as const) : value,
// 		),

// 	defaultValue: z
// 		.union([
// 			z.object({ value: z.any(), type: z.literal("raw") }),
// 			z.object({ value: z.string(), type: z.literal("normal") }),
// 		])
// 		.nullish(),
// })

export type DropColumnParams = SharedParams & { tableName: string; columnName: string }
/**
 *
 */
// export const DropColumnSchema = CreateColumnSchema.pick({
// 	tableName: true,
// 	columnName: true,
// 	schema: true,
// 	trx: true,
// })

// export const UpdateColumnSchema = CreateColumnSchema.pick({
// 	tableName: true,
// 	columnName: true,
// 	defaultValue: true,
// 	trx: true,
// 	schema: true,
// }).extend({
// 	nullable: z.boolean().nullish(),
// 	unique: z.boolean().nullish(),
// })

export type UpdateColumnParams = SharedParams & {
	tableName: string
	columnName: string
	nullable?: boolean
	unique?: boolean
	defaultValue?: DefaultValueType
}
