export type DbColumn = {
	columnName: string
	nullable: boolean
	defaultValue: string | null
	primaryKey: boolean
	tableName: string
	unique: boolean
	autoIncrement: boolean
	comment?: string
	dataType: string
	schemaName?: string
}
