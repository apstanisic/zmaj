import {
	randAnimalType,
	randBoolean,
	randChanceBoolean,
	randJobTitle,
	randPastDate,
} from "@ngneat/falso"
import { CollectionMetadataSchema, Stub } from "@zmaj-js/common"

export const CollectionMetadataStub = Stub(CollectionMetadataSchema, () => ({
	createdAt: randPastDate(),
	// description: randSentence(),
	disabled: randChanceBoolean({ chanceTrue: 0.15 }),
	hidden: randBoolean(),
	label: randJobTitle(),
	tableName: randAnimalType(),
	// validation: {},
	layoutConfig: {},
	displayTemplate: "{id}",
	// createdAtFieldId: null,
	// updatedAtFieldId: null,
	// icon: randWord(),
	// fieldsOrder: [],
}))
