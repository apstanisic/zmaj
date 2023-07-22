import { Class } from "type-fest"
import { createModelsStore } from "./create-models-store"
import { BaseModel } from "./model-builder/BaseModel"
import { PojoModel, PojoModelField, PojoModelRelation } from "./pojo-model"

export function convertModelFromClassToPojo(
	ModelClass: Class<BaseModel> | PojoModel,
	store: ReturnType<typeof createModelsStore>,
): PojoModel {
	if (typeof ModelClass === "object") return ModelClass
	const model = store.getModel(ModelClass)

	return {
		name: model.name,
		tableName: model.tableName ?? model.name,
		fields: convertAllModelFieldsFromClassToPojo(model.fields),
		relations: convertAllModelRelationsFromClassToPojo(ModelClass, store),
		disabled: model.disabled,
	}
}

function convertAllModelRelationsFromClassToPojo(
	modelClass: Class<BaseModel>,
	store: ReturnType<typeof createModelsStore>,
): PojoModel["relations"] {
	const model = store.getModel(modelClass)
	const relations = model.getRelations()

	const expanded: Record<string, PojoModelRelation> = {}

	for (const [property, relation] of Object.entries(relations)) {
		const type = relation.options.type
		const otherSide = store.getModel(relation.modelFn())

		if (type === "many-to-one" || type === "owner-one-to-one") {
			expanded[property] = {
				type,
				field: relation.options.fkField,
				referencedField: relation.options.referencedField ?? otherSide.getPkField(),
				referencedModel: otherSide.name,
			}
		} else if (type === "one-to-many" || type === "ref-one-to-one") {
			expanded[property] = {
				type,
				field: relation.options.referencedField ?? model.getPkField(),
				referencedField: relation.options.fkField,
				referencedModel: otherSide.name,
			}
		} else if (type === "many-to-many") {
			const junctionModel = store.getModel(relation.options.junction())
			expanded[property] = {
				type,
				field: model.getPkField(),
				junctionField: relation.options.fields[0],
				junctionReferencedField: relation.options.fields[1],
				junctionModel: junctionModel.name,
				referencedModel: otherSide.name,
				referencedField: otherSide.getPkField(),
			}
		}
	}
	return expanded
}

function convertAllModelFieldsFromClassToPojo(
	fields: BaseModel["fields"],
): Record<string, PojoModelField> {
	const fieldEntries = Object.entries(fields).map(([fieldName, field]) => {
		return [fieldName, convertModelFieldFromClassToPojo(fieldName, field)]
	})
	return Object.fromEntries(fieldEntries)
}

function convertModelFieldFromClassToPojo(
	fieldName: string,
	field: BaseModel["fields"][string],
): PojoModelField {
	return {
		fieldName,
		dataType: field.dataType,
		canCreate: field.canCreate,
		canUpdate: field.canUpdate,
		canRead: field.canRead,
		columnName: field.columnName,
		hasDefaultValue: field.hasDefault,
		isAutoIncrement: field.isAutoIncrement,
		isNullable: field.nullable,
		isPrimaryKey: field.isPk,
		isCreatedAt: field.isCreatedAt,
		isUnique: field.isUnique,
		isUpdatedAt: field.isUpdatedAt,
	}
}
