import {
	randChanceBoolean,
	randColor,
	randDatabaseColumn,
	randPastDate,
	randUuid,
	randWord,
} from "@ngneat/falso"
import { RelationMetadata, Stub } from "@zmaj-js/common"
import { chance } from "../chance.js"

export const RelationMetadataStub = Stub<RelationMetadata>(() => ({
	id: randUuid(),
	createdAt: randPastDate(),
	fkName: `${randDatabaseColumn()}_fk`,
	hidden: randChanceBoolean({ chanceTrue: 0.2 }),
	tableName: randColor(),
	label: randWord(),
	template: null,
	propertyName: randColor(),
	mtmFkName: chance(0.3, `${randDatabaseColumn()}_fk`, null),
}))
