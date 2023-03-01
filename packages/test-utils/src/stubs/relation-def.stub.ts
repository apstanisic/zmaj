import { randColor, randWord } from "@ngneat/falso"
import { RelationDef, Stub, StubResult } from "@zmaj-js/common"
import { camel, pick } from "radash"
import { RelationMetadataStub } from "./relation-metadata.js"

export const RelationDefStub: StubResult<RelationDef> = Stub<RelationDef>(() => {
	const base = RelationMetadataStub()
	const leftColumn = randColor()
	const rightColumn = randColor()
	const leftTable = base.tableName
	const rightTable = randWord()
	const notMtm: RelationDef = {
		relation: base,
		type: "many-to-one",
		collectionName: camel(leftTable),
		tableName: leftTable,
		columnName: leftColumn,
		fieldName: camel(leftColumn),
		propertyName: base.propertyName,
		id: base.id,
		otherSide: {
			columnName: rightColumn,
			tableName: rightTable,
			fieldName: camel(rightColumn),
			propertyName: randWord(),
			collectionName: camel(rightTable),
		},

		// mtmFkName: null,
		// collectionId: v4(),
	}

	if (!base.mtmFkName) return notMtm

	const junctionLeftColumn = randColor()
	const junctionRightColumn = randColor()

	const junctionTable = randWord()
	return {
		...pick(notMtm, [
			"collectionName",
			"columnName",
			"id",
			"tableName",
			"propertyName",
			"relation",
			"fieldName",
			"otherSide",
		]),
		mtmFkName: base.mtmFkName!,
		type: "many-to-many",

		junction: {
			collectionName: camel(junctionTable),
			tableName: junctionTable,
			collectionAuthzKey: `collections.${camel(junctionTable)}`,
			uniqueKey: randWord(),
			thisSide: {
				columnName: junctionLeftColumn,
				fieldName: camel(junctionLeftColumn),
				propertyName: camel(leftTable),
			},

			otherSide: {
				columnName: junctionRightColumn,
				fieldName: camel(junctionRightColumn),
				propertyName: camel(rightTable),
			},
		},
	}
})
