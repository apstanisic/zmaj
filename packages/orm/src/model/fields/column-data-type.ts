export const baseDataTypes = [
	"text",
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
] as const

export const arrayDataTypes = [
	"array.text",
	// number
	"array.int",
	"array.float",
	// date
	"array.datetime",
	"array.date",
	"array.time",
	// other
	"array.boolean",
	"array.json",
	"array.uuid",
] as const

export const columnTypes = [...baseDataTypes, ...arrayDataTypes] as const

export type ColumnDataType = (typeof columnTypes)[number]
// type ArrayColumnType = (typeof arrayDataTypes)[number]
// type BaseColumnType = (typeof baseDataTypes)[number]
