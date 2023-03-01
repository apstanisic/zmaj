import { randBoolean, randDatabaseColumn, randDatabaseType, randWord } from "@ngneat/falso"
import { DbColumnSchema, Stub } from "@zmaj-js/common"

export const DbColumnStub = Stub(DbColumnSchema, () => ({
	autoIncrement: randBoolean(),
	columnName: randDatabaseColumn(),
	dataType: randDatabaseType(),
	nullable: randBoolean(),
	primaryKey: randBoolean(),
	tableName: randWord(),
	unique: randBoolean(),
	defaultValue: randBoolean() ? "default" : null,
	comment: undefined,
	schemaName: "public",
	foreignKey: undefined,
}))
