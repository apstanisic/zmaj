import { CollectionDef, snakeCase } from "@zmaj-js/common"
import { BaseModel, PojoModel } from "@zmaj-js/orm"
import { mapValues } from "radash"
import { Class } from "type-fest"

/**
 *  This is used when we build collection from DB
 */
function collectionToPojoModel(collection: CollectionDef): PojoModel {
	const relations = mapValues(collection.relations, (rel): PojoModel["relations"][number] => {
		if (rel.type !== "many-to-many") {
			return {
				field: rel.fieldName,
				referencedModel: rel.otherSide.collectionName,
				referencedField: rel.otherSide.fieldName,
				type: rel.type,
				otherPropertyName: rel.otherSide.propertyName,
			}
		} else {
			return {
				type: "many-to-many",
				field: rel.fieldName,
				referencedModel: rel.otherSide.collectionName,
				referencedField: rel.otherSide.fieldName,
				otherPropertyName: rel.otherSide.propertyName,
				junctionModel: rel.junction.collectionName,
				junctionField: rel.junction.thisSide.fieldName,
				junctionReferencedField: rel.junction.otherSide.fieldName,
			}
		}
	})

	return {
		isPojoModel: true,
		name: collection.collectionName,
		tableName: collection.tableName ?? snakeCase(collection.collectionName),
		idField: collection.pkField,
		updatedAtField:
			Object.entries(collection.fields).find(
				([fieldName, config]) => config.isUpdatedAt,
			)?.[0] ?? null,
		createdAtField:
			Object.entries(collection.fields).find(
				([fieldName, config]) => config.isCreatedAt,
			)?.[0] ?? null,
		fields: collection.fields,
		relations,
		disabled: collection.disabled,
	}
}

export function mixedColDef(
	collections: (CollectionDef | PojoModel | Class<BaseModel>)[],
): (PojoModel | Class<BaseModel>)[] {
	return collections.map((c) => {
		if (typeof c === "function") return c
		if ("isPojoModel" in c) {
			return c
		}
		return collectionToPojoModel(c)
	})
}
