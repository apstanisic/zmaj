import { getAuthzKey, isIn } from "@common/utils/mod"
import { camel, pick } from "radash"
import { CompositeUniqueKey } from "../database/composite-unique-key.type"
import { ForeignKey } from "../database/foreign-key.type"
import { CollectionDef } from "../infra-collections/collection-def.type"
import { CollectionMetadata } from "../infra-collections/collection-metadata.model"
import { RelationDef } from "./relation-def.type"
import { RelationMetadata } from "./relation-metadata.model"

type ExpandRelationParams = {
	allRelations: readonly RelationMetadata[]
	fks: readonly ForeignKey[]
	collections: readonly (CollectionMetadata | CollectionDef)[]
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
	const { fks, collections, allRelations, compositeUniqueKeys, onError } = rest
	const collection =
		collections.find((c) => c.tableName === relation.tableName) ?? onError(97442123)

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
	const rightTable = isFkOwner ? fk.referencedTable : fk.fkTable
	const leftTable = isFkOwner ? fk.fkTable : fk.referencedTable

	// should always be true
	// const rightCollection = collections.find((c) => c.tableName === rightTable) ?? throw500(939232)

	// other side of relation
	const rightRelationDirect = allRelations.find(
		(r) => r.fkName === relation.fkName && r.tableName === rightTable,
	)

	const relationEx: RelationDef = {
		id: relation.id,
		type,
		relation,
		tableName: relation.tableName,
		collectionName: camel(collection.tableName),
		columnName: isFkOwner ? fk.fkColumn : fk.referencedColumn,
		fieldName: camel(isFkOwner ? fk.fkColumn : fk.referencedColumn),
		propertyName: relation.propertyName,
		otherSide: {
			tableName: rightTable,
			collectionName: camel(rightTable),
			columnName: !isFkOwner ? fk.fkColumn : fk.referencedColumn,
			fieldName: camel(!isFkOwner ? fk.fkColumn : fk.referencedColumn),
			propertyName: rightRelationDirect?.propertyName,
			relationId: rightRelationDirect?.id,
		},
	}
	// If direct relation, this is the end
	if (!relation.mtmFkName) return relationEx

	if (fk.referencedTable !== collection.tableName) {
		throw new Error("7687234")
	}

	const otherFk =
		fks.find((fk) => fk.fkName === relation.mtmFkName && fk.fkTable === fk.fkTable) ??
		onError(95623988)

	const rightCollection = collections.find((col) => col.tableName === otherFk.referencedTable)

	const rightRelation = allRelations.find(
		// (r) => r.fkName === otherFk.fkName && r.collectionId === rightCollection?.id,
		(r) => r.fkName === otherFk.fkName && r.tableName === rightCollection?.tableName,
	)
	const compositeUnique =
		compositeUniqueKeys.find(
			(key) =>
				key.tableName === fk.fkTable && //
				key.columnNames.includes(fk.fkColumn) &&
				key.columnNames.includes(otherFk.fkColumn),
		) ?? onError(3792340)

	const junctionOtherSide = allRelations.find(
		(r) => r.tableName === relationEx.otherSide.tableName && r.fkName === otherFk.fkName,
	)

	const relation2: RelationDef = {
		id: relationEx.id,
		type: "many-to-many",
		...pick(relationEx, [
			"relation",
			"tableName",
			"columnName",
			"collectionName",
			"fieldName",
			"propertyName",
		]),
		junction: {
			uniqueKey: compositeUnique.keyName,
			thisSide: pick(relationEx.otherSide, ["fieldName", "columnName", "propertyName"]),
			collectionName: relationEx.otherSide.collectionName,
			tableName: relationEx.otherSide.tableName,
			collectionAuthzKey: getAuthzKey(relationEx.otherSide.collectionName),
			otherSide: {
				fieldName: camel(otherFk.fkColumn),
				columnName: otherFk.fkColumn,
				propertyName: junctionOtherSide?.propertyName,
				// propertyName:
			},
		},
		otherSide: {
			columnName: otherFk.referencedColumn,
			tableName: otherFk.referencedTable,
			collectionName: camel(otherFk.referencedTable),
			fieldName: camel(otherFk.referencedColumn),
			propertyName: rightRelation?.propertyName,
			relationId: rightRelation?.id,
		},
	}
	return relation2
}
