import { rand, randBoolean, randDatabaseColumn, randWord } from "@ngneat/falso"
import { ForeignKeySchema, onColumnDeleteActions, stub } from "@zmaj-js/common"
import { ForeignKey } from "@zmaj-js/orm"

export const ForeignKeyStub = stub<ForeignKey>(
	() => ({
		fkColumn: randDatabaseColumn(),
		fkTable: randWord(),
		referencedColumn: randDatabaseColumn(),
		referencedTable: randWord(),
		fkName: randWord(),
		fkColumnUnique: randBoolean(),
		onDelete: rand(onColumnDeleteActions),
		fkColumnDataType: "uuid",
		onUpdate: null,
	}),
	ForeignKeySchema,
)
