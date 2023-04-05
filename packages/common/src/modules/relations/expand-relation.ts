import { getAuthzKey, isIn } from "@common/utils/mod"
import { objectify } from "radash"
import { CompositeUniqueKey } from "../database/composite-unique-key.type"
import { ForeignKey } from "../database/foreign-key.type"
import { CollectionDef } from "../infra-collections/collection-def.type"
import { CollectionMetadata } from "../infra-collections/collection-metadata.model"
import { RelationDef } from "./relation-def.type"
import { RelationMetadata } from "./relation-metadata.model"
import { FieldMetadata, nestByTableAndColumnName } from "../infra-fields"

type ExpandRelationParams = {
	allRelations: readonly RelationMetadata[]
	fks: readonly ForeignKey[]
	collections: readonly (CollectionMetadata | CollectionDef)[]
	fields: FieldMetadata[]
	compositeUniqueKeys: readonly CompositeUniqueKey[]
	onError: (code: number) => never
}

/**
 *
 * Tests for this are located in API package since I can't access test utils
 * in this package.
 */
export function expandRelation(
	relation: RelationMetadata,
	rest: ExpandRelationParams,
): RelationDef {
	const { fks, allRelations, compositeUniqueKeys, onError } = rest
	const collections = objectify(rest.collections, (c) => c.tableName)
	const fields = nestByTableAndColumnName(rest.fields)

	if (relation.mtmFkName === null) {
		const collection = collections[relation.tableName] ?? onError(97442123)
		const fk =
			fks.find(
				(fk) =>
					fk.fkName === relation.fkName &&
					isIn(collection.tableName, [fk.fkTable, fk.referencedTable]),
			) ?? onError(97423)
		// is fk located in collection table or on other side
		const isFkOwner = fk.fkTable === collection.tableName

		const type = isFkOwner
			? fk.fkColumnUnique
				? "owner-one-to-one"
				: "many-to-one"
			: fk.fkColumnUnique
			? "ref-one-to-one"
			: "one-to-many"

		// get other table
		const leftTable = relation.tableName // isFkOwner ? fk.fkTable : fk.referencedTable
		const leftColumn = fk.fkTable === leftTable ? fk.fkColumn : fk.referencedColumn
		const rightTable = fk.fkTable === leftTable ? fk.referencedTable : fk.fkTable
		const rightColumn = fk.fkTable === leftTable ? fk.referencedColumn : fk.fkColumn
		const otherSide = allRelations.find(
			(rightRel) => rightRel.fkName === relation.fkName && rightRel.tableName === rightTable,
		)

		const rightCollection = collections[rightTable] ?? onError(28399)

		const leftField = fields[leftTable]?.[leftColumn] ?? onError(737992)
		const rightField = fields[rightTable]?.[rightColumn] ?? onError(91222)

		return {
			type,
			collectionName: collection.collectionName,
			tableName: collection.tableName,
			relation,
			propertyName: relation.propertyName,
			id: relation.id,
			columnName: leftField.columnName,
			fieldName: leftField.fieldName,
			otherSide: {
				collectionName: rightCollection.collectionName,
				tableName: rightCollection.tableName,
				columnName: rightField.columnName,
				fieldName: rightField.fieldName,
				propertyName: otherSide?.propertyName,
				relationId: otherSide?.id,
			},
		}
		// isFkOwner ? fk.referencedTable : fk.fkTable
	} else {
		const leftFk =
			fks.find(
				(fk) => fk.fkName === relation.fkName && fk.referencedTable === relation.tableName,
			) ?? onError(39992)
		const rightFk =
			fks.find((fk) => fk.fkName === relation.mtmFkName && fk.fkTable === leftFk?.fkTable) ??
			onError(19292)

		const leftCol = collections[leftFk.referencedTable] ?? onError(123989)
		const rightCol = collections[rightFk.referencedTable] ?? onError(39292)
		const junctionCol = collections[leftFk.fkTable] ?? onError(9399)

		const leftField = fields[leftFk.referencedTable]?.[leftFk.referencedColumn] ?? onError(89223)
		const rightField = fields[rightFk.referencedTable]?.[rightFk.referencedColumn] ?? onError(9732)
		const junctionLeftField = fields[leftFk.fkTable]?.[leftFk.fkColumn] ?? onError(9789)
		const junctionRightField = fields[rightFk.fkTable]?.[rightFk.fkColumn] ?? onError(987333)

		const rightRelation = allRelations.find(
			(r) => r.fkName === relation.mtmFkName && r.mtmFkName === relation.fkName,
		)

		const compositeUnique =
			compositeUniqueKeys.find(
				(key) =>
					key.tableName === leftFk.fkTable && //
					key.columnNames.includes(leftFk.fkColumn) &&
					key.columnNames.includes(rightFk.fkColumn),
			) ?? onError(3792340)
		const leftJunctionRel =
			allRelations.find(
				(r) => r.tableName === junctionCol.tableName && r.fkName === relation.fkName,
			) ?? onError(38882)

		const rightJunctionRel =
			allRelations.find(
				(r) => r.tableName === junctionCol.tableName && r.fkName === relation.mtmFkName,
			) ?? onError(839992)

		return {
			type: "many-to-many",
			collectionName: leftCol.collectionName,
			tableName: leftCol.tableName,
			columnName: leftField?.columnName,
			fieldName: leftField?.fieldName,
			propertyName: relation.propertyName,
			id: relation.id,
			relation,
			otherSide: {
				collectionName: rightCol.collectionName,
				tableName: rightCol.tableName,
				columnName: rightField?.columnName,
				fieldName: rightField?.fieldName,
				propertyName: rightRelation?.propertyName,
				relationId: rightRelation?.id,
			},
			junction: {
				collectionName: junctionCol.collectionName,
				tableName: junctionCol.tableName,
				collectionAuthzKey: getAuthzKey(junctionCol.collectionName),
				uniqueKey: compositeUnique.keyName,
				thisSide: {
					columnName: junctionLeftField?.columnName,
					fieldName: junctionLeftField?.fieldName,
					propertyName: leftJunctionRel.propertyName,
				},
				otherSide: {
					columnName: junctionRightField?.columnName,
					fieldName: junctionRightField?.fieldName,
					propertyName: rightJunctionRel.propertyName,
				},
			},
		}
	}

	// const fk =
	// 	fks.find(
	// 		(fk) =>
	// 			fk.fkName === relation.fkName &&
	// 			isIn(collection.tableName, [fk.fkTable, fk.referencedTable]),
	// 	) ?? onError(97423)
	// // is fk located in collection table or on other side
	// const isFkOwner = fk.fkTable === collection.tableName

	// const type = isFkOwner
	// 	? fk.fkColumnUnique
	// 		? "owner-one-to-one"
	// 		: "many-to-one"
	// 	: fk.fkColumnUnique
	// 	? "ref-one-to-one"
	// 	: "one-to-many"

	// // get other table
	// const rightTable = isFkOwner ? fk.referencedTable : fk.fkTable
	// const leftTable = isFkOwner ? fk.fkTable : fk.referencedTable

	// // should always be true
	// // const rightCollection = collections.find((c) => c.tableName === rightTable) ?? throw500(939232)

	// // other side of relation
	// const rightRelationDirect = allRelations.find(
	// 	(r) => r.fkName === relation.fkName && r.tableName === rightTable,
	// )

	// const relationEx: RelationDef = {
	// 	id: relation.id,
	// 	type,
	// 	relation,
	// 	tableName: relation.tableName,
	// 	collectionName: camel(collection.tableName),
	// 	columnName: isFkOwner ? fk.fkColumn : fk.referencedColumn,
	// 	fieldName: camel(isFkOwner ? fk.fkColumn : fk.referencedColumn),
	// 	propertyName: relation.propertyName,
	// 	otherSide: {
	// 		tableName: rightTable,
	// 		collectionName: camel(rightTable),
	// 		columnName: !isFkOwner ? fk.fkColumn : fk.referencedColumn,
	// 		fieldName: camel(!isFkOwner ? fk.fkColumn : fk.referencedColumn),
	// 		propertyName: rightRelationDirect?.propertyName,
	// 		relationId: rightRelationDirect?.id,
	// 	},
	// }
	// // If direct relation, this is the end
	// if (!relation.mtmFkName) return relationEx

	// if (fk.referencedTable !== collection.tableName) {
	// 	throw new Error("7687234")
	// }

	// const otherFk =
	// 	fks.find((fk) => fk.fkName === relation.mtmFkName && fk.fkTable === fk.fkTable) ??
	// 	onError(95623988)

	// const rightCollection = collections[otherFk.referencedTable] // .find((col) => col.tableName === otherFk.referencedTable)

	// const rightRelation = allRelations.find(
	// 	// (r) => r.fkName === otherFk.fkName && r.collectionId === rightCollection?.id,
	// 	(r) => r.fkName === otherFk.fkName && r.tableName === rightCollection?.tableName,
	// )
	// const compositeUnique =
	// 	compositeUniqueKeys.find(
	// 		(key) =>
	// 			key.tableName === fk.fkTable && //
	// 			key.columnNames.includes(fk.fkColumn) &&
	// 			key.columnNames.includes(otherFk.fkColumn),
	// 	) ?? onError(3792340)

	// const junctionOtherSide = allRelations.find(
	// 	(r) => r.tableName === relationEx.otherSide.tableName && r.fkName === otherFk.fkName,
	// )

	// const relation2: RelationDef = {
	// 	id: relationEx.id,
	// 	type: "many-to-many",
	// 	...pick(relationEx, [
	// 		"relation",
	// 		"tableName",
	// 		"columnName",
	// 		"collectionName",
	// 		"fieldName",
	// 		"propertyName",
	// 	]),
	// 	junction: {
	// 		uniqueKey: compositeUnique.keyName,
	// 		thisSide: pick(relationEx.otherSide, ["fieldName", "columnName", "propertyName"]),
	// 		collectionName: relationEx.otherSide.collectionName,
	// 		tableName: relationEx.otherSide.tableName,
	// 		collectionAuthzKey: getAuthzKey(relationEx.otherSide.collectionName),
	// 		otherSide: {
	// 			fieldName: camel(otherFk.fkColumn),
	// 			columnName: otherFk.fkColumn,
	// 			propertyName: junctionOtherSide?.propertyName,
	// 			// propertyName:
	// 		},
	// 	},
	// 	otherSide: {
	// 		columnName: otherFk.referencedColumn,
	// 		tableName: otherFk.referencedTable,
	// 		collectionName: camel(otherFk.referencedTable),
	// 		fieldName: camel(otherFk.referencedColumn),
	// 		propertyName: rightRelation?.propertyName,
	// 		relationId: rightRelation?.id,
	// 	},
	// }
	// return relation2
}
