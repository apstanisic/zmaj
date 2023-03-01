import {
	randBoolean,
	randDatabaseColumn,
	randPastDate,
	randSentence,
	randWord,
} from "@ngneat/falso"
import { FieldMetadataSchema, snakeCase, Stub } from "@zmaj-js/common"
import { random } from "radash"

export const FieldMetadataStub = Stub(FieldMetadataSchema, () => ({
	canRead: true,
	canCreate: true,
	canUpdate: true,
	createdAt: randPastDate(),
	width: random(1, 12), // includes 12
	componentName: null,
	label: randWord(),
	columnName: snakeCase(randDatabaseColumn()),
	fieldConfig: {},
	description: randBoolean() ? randSentence() : null,
	tableName: randWord(),
	isCreatedAt: false,
	isUpdatedAt: false,
	sortable: true,
}))
