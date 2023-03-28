import {
	randBoolean,
	randDatabaseColumn,
	randPastDate,
	randSentence,
	randWord,
} from "@ngneat/falso"
import { FieldMetadata, FieldMetadataSchema, snakeCase, stub } from "@zmaj-js/common"
import { random } from "radash"
import { v4 } from "uuid"

export const FieldMetadataStub = stub<FieldMetadata>(
	() => ({
		displayTemplate: null,
		id: v4(),
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
	}),
	FieldMetadataSchema,
)
