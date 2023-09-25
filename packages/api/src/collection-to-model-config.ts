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
		name: collection.collectionName,
		tableName: collection.tableName ?? snakeCase(collection.collectionName),
		fields: collection.fields,
		relations,
		disabled: collection.disabled,
	}
}

export function mixedColDef(
	collections: (CollectionDef | PojoModel | Class<BaseModel>)[],
): (PojoModel | Class<BaseModel>)[] {
	return collections.map((c) => {
		return "collectionName" in c ? collectionToPojoModel(c) : c
	})
}

// export function modelToModelConfig(
// 	ModelClass: Class<BaseModel>,
// 	store: ReturnType<typeof createModelsStore>,
// ): ModelConfig {
// 	const model = store.get(ModelClass)
// 	return {
// 		collectionName: model.name,
// 		tableName: model.tableName ?? snakeCase(model.name),
// 		fields: mapValues(model.fields, (v, f) => ({ ...v, fieldName: f })),
// 		relations: {},
// 		disabled: false,
// 	}
// }
