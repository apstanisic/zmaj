import { CollectionDef } from "@zmaj-js/common"
import { ModelConfig, ModelRelation } from "@zmaj-js/orm"
import { mapValues } from "radash"

function collectionToModel(collection: CollectionDef): ModelConfig {
	const relations = mapValues(collection.relations, (rel): ModelRelation => {
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
		collectionName: collection.collectionName,
		tableName: collection.tableName,
		fields: collection.fields,
		relations,
		disabled: collection.disabled,
	}
}
