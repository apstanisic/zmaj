import { randColor, randWord } from "@ngneat/falso"
import { DirectRelation, JunctionRelation, RelationDef, stub } from "@zmaj-js/common"
import { camel } from "radash"
import { RelationMetadataStub } from "./relation-metadata.js"

export const RelationDefStub = stub<RelationDef>((modify) => {
	const base = RelationMetadataStub(modify.relation)
	if (modify.type === "many-to-many") {
		base.mtmFkName = randWord()
	}
	const leftColumn = modify.columnName ?? randColor()
	const rightColumn = modify.otherSide?.columnName ?? randColor()
	const leftTable = base.tableName
	const rightTable = modify.otherSide?.tableName ?? randWord()
	const notMtm: RelationDef = {
		relation: base,
		type: "many-to-one",
		collectionName: modify.collectionName ?? camel(leftTable),
		tableName: leftTable,
		columnName: leftColumn,
		fieldName: modify.fieldName ?? camel(leftColumn),
		propertyName: base.propertyName,
		id: base.id,
		otherSide: modify.otherSide ?? {
			columnName: rightColumn,
			tableName: rightTable,
			fieldName: camel(rightColumn),
			propertyName: randWord(),
			collectionName: camel(rightTable),
		},
	} satisfies DirectRelation

	if (!base.mtmFkName) return notMtm

	const junctionLeftColumn = modify.junction?.thisSide.columnName ?? randColor()
	const junctionRightColumn = modify.junction?.otherSide.columnName ?? randColor()

	const junctionTable = modify.junction?.tableName ?? randWord()
	return {
		...notMtm,
		type: "many-to-many",
		junction: {
			collectionName: camel(junctionTable),
			tableName: junctionTable,
			collectionAuthzKey: `collections.${camel(junctionTable)}`,
			uniqueKey: randWord(),
			thisSide: {
				columnName: junctionLeftColumn,
				fieldName: camel(junctionLeftColumn),
			},

			otherSide: {
				columnName: junctionRightColumn,
				fieldName: camel(junctionRightColumn),
			},
		},
	} satisfies JunctionRelation
})
