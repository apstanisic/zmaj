export const baseDataTypes = [
	"text" as "text" | `text_${number}`,
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
	"array.text" as "array.text" | `array.text_${number}`,
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

export const columnTypes = [...baseDataTypes] as const

export type ColumnType = typeof columnTypes[number]
export type ArrayColumnType = typeof arrayDataTypes[number]
export type BaseColumnType = typeof baseDataTypes[number]
