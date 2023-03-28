import { randBoolean, randDatabaseColumn, randDatabaseType, randWord } from "@ngneat/falso"
import { DbColumn, DbColumnSchema, stub } from "@zmaj-js/common"

export const DbColumnStub = stub<DbColumn>(
	() => ({
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
	}),
	DbColumnSchema,
)
