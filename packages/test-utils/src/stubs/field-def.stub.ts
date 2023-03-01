import { randBoolean, randChanceBoolean, randDatabaseType, randWord } from "@ngneat/falso"
import { FieldDef, getColumnType, Stub, StubResult } from "@zmaj-js/common"
import { camel } from "radash"
import { FieldMetadataStub } from "./field-metadata.stub.js"

export const FieldDefStub: StubResult<FieldDef> = Stub<FieldDef>(() => {
	const base = FieldMetadataStub()
	const type = randDatabaseType()

	const def = randBoolean() ? randWord() : null

	return {
		...base,
		// tableName: randWord(),
		// collectionId: v4(),
		collectionName: camel(base.tableName),
		isPrimaryKey: randChanceBoolean({ chanceTrue: 0.15 }),
		isNullable: randBoolean(),
		isUnique: randChanceBoolean({ chanceTrue: 0.25 }),
		isAutoIncrement: randChanceBoolean({ chanceTrue: 0.1 }),
		dbRawDataType: type,
		isForeignKey: false,
		dbDefaultValue: def,
		hasDefaultValue: def !== null,
		fieldName: camel(base.columnName),
		dataType: getColumnType(type),
	}
})
