import { Class } from "type-fest"
import { ModelConfig, ModelField } from "."
import { createModelsStore } from "./create-models-store"
import { BaseModel } from "./model-builder/BaseModel"

export function expandModelRelations<TModel extends BaseModel = BaseModel>(
	modelClass: Class<TModel>,
	modelsState: ReturnType<typeof createModelsStore>,
): ModelConfig["relations"] {
	const model = modelsState.getModel(modelClass)
	const relations = model.getRelations()

	const expanded: ModelConfig["relations"] = {}

	for (const [property, relation] of Object.entries(relations)) {
		const type = relation.options.type
		const otherSide = modelsState.getModel(relation.modelFn())

		if (type === "many-to-one" || type === "owner-one-to-one") {
			expanded[property] = {
				type,
				field: relation.options.fkField,
				referencedField: relation.options.referencedField ?? otherSide.getPkField(),
				referencedModel: otherSide.name,
			}
			// // const fkField =
			// const fkColumn = (model.fields[fkField] as UserParams).columnName ?? fkField
			// const refField = relation.options.referencedField ?? otherSide.getPkField()
			// const refColumn = (otherSide.fields[refField] as UserParams).columnName ?? refField
			// const modelName = model.name
			// const table = model.tableName ?? modelName
			// const otherModelName = otherSide.name
			// const otherTable = otherSide.tableName ?? modelName
		} else if (type === "one-to-many" || type === "ref-one-to-one") {
			expanded[property] = {
				type,
				field: relation.options.referencedField ?? model.getPkField(),
				referencedField: relation.options.fkField,
				referencedModel: otherSide.name,
			}
		} else {
			return undefined as any
			// const relDef: ModelRelation = {
			// 	type,
			// 	// field:
			// 	// field: relation.options.referencedField ?? model.getPkField(),
			// 	// referencedField: relation.options.fkField,
			// 	// referencedModel: otherSide.name,
			// }
		}
		//
	}
	return expanded
}

export function convertModelClassToPlain(
	ModelClass: Class<BaseModel> | ModelConfig,
	models: ReturnType<typeof createModelsStore>,
): ModelConfig {
	if (typeof ModelClass === "object") return ModelClass
	const model = structuredClone(models.getModel(ModelClass))
	const fields = Object.entries(model.fields).map(([fieldName, field]): [string, ModelField] => [
		fieldName,
		{
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
		},
	])
	return {
		name: model.name,
		tableName: model.tableName ?? model.name,
		fields: Object.fromEntries(fields),
		relations: expandModelRelations(ModelClass, models),
		disabled: model.disabled,
	}
}
