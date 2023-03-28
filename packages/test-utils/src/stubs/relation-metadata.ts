import {
	randChanceBoolean,
	randColor,
	randDatabaseColumn,
	randPastDate,
	randUuid,
	randWord,
} from "@ngneat/falso"
import { RelationMetadataSchema, stub } from "@zmaj-js/common"
import { chance } from "../chance.js"

export const RelationMetadataStub = stub(
	() => ({
		id: randUuid(),
		createdAt: randPastDate(),
		fkName: `${randDatabaseColumn()}_fk`,
		hidden: randChanceBoolean({ chanceTrue: 0.2 }),
		tableName: randColor(),
		label: randWord(),
		template: null,
		propertyName: randColor(),
		mtmFkName: chance(0.3, `${randDatabaseColumn()}_fk`, null),
	}),
	RelationMetadataSchema,
)
