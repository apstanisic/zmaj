export type UniqueKey = {
	schemaName: string
	tableName: string
	keyName: string
	columnNames: [string, ...string[]]
}

export type SingleUniqueKey = {
	schemaName: string
	tableName: string
	keyName: string
	columnName: string
}

export type CompositeUniqueKey = {
	schemaName: string
	tableName: string
	keyName: string
	columnNames: [string, string, ...string[]]
}
