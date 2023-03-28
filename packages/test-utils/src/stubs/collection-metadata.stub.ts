import { randBoolean, randChanceBoolean, randJobTitle, randPastDate, randWord } from "@ngneat/falso"
import { CollectionMetadata, CollectionMetadataSchema, stub } from "@zmaj-js/common"
import { camel } from "radash"
import { v4 } from "uuid"

export const CollectionMetadataStub = stub<CollectionMetadata>((modify) => {
	const tableName = modify.tableName ?? randWord()
	return {
		createdAt: randPastDate(),
		disabled: randChanceBoolean({ chanceTrue: 0.15 }),
		hidden: randBoolean(),
		label: randJobTitle(),
		tableName,
		collectionName: modify.collectionName ?? camel(tableName),
		layoutConfig: {},
		displayTemplate: "{id}",
		id: v4(),
	}
}, CollectionMetadataSchema)
