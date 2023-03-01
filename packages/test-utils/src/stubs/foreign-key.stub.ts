import { randBoolean, randDatabaseColumn, randWord } from "@ngneat/falso"
import { ForeignKeySchema, Stub } from "@zmaj-js/common"

export const ForeignKeyStub = Stub(ForeignKeySchema, () => ({
	fkColumn: randDatabaseColumn(),
	fkTable: randWord(), //
	// pkColumn: randDatabaseColumn(),
	// pkTable: randWord(),
	referencedColumn: randDatabaseColumn(),
	referencedTable: randWord(),
	fkName: randWord(),
	fkColumnUnique: randBoolean(),
	onDelete: "NO ACTION" as const,
	fkColumnDataType: "uuid",
	onUpdate: null,
}))
