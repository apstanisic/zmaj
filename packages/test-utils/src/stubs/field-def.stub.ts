import { randBoolean, randChanceBoolean, randDatabaseType, randWord } from "@ngneat/falso"
import { FieldConfigSchema, FieldDef, FieldDefSchema, getColumnType, stub } from "@zmaj-js/common"
import { camel } from "radash"
import { FieldMetadataStub } from "./field-metadata.stub.js"

export const FieldDefStub = stub<FieldDef>((modify) => {
	const base = FieldMetadataStub(modify)
	const type = randDatabaseType()

	const defaultValue = randBoolean() ? randWord() : null

	return {
		...base,
		collectionName: camel(base.tableName),
		isPrimaryKey: randChanceBoolean({ chanceTrue: 0.15 }),
		isNullable: randBoolean(),
		isUnique: randChanceBoolean({ chanceTrue: 0.25 }),
		isAutoIncrement: randChanceBoolean({ chanceTrue: 0.1 }),
		dbRawDataType: type,
		isForeignKey: false,
		dbDefaultValue: defaultValue,
		hasDefaultValue: defaultValue !== null,
		fieldName: camel(base.columnName),
		dataType: getColumnType(type),
		fieldConfig: FieldConfigSchema.parse({}),
	}
}, FieldDefSchema)
