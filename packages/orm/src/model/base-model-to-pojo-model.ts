import { ModelsState } from "@orm-engine/create-models-store"
import { ZmajOrmError } from ".."
import { BaseModel } from "./base-model"
import { PojoModel, PojoModelField, PojoModelRelation } from "./pojo-model"

/**
 * This converts BaseModel class to plain object model, that will be consumed by underlying engine
 */
export function baseModelToPojoModel(
	ModelClass: BaseModel | PojoModel,
	getOne: ModelsState["getOne"],
): PojoModel {
	if (ModelClass instanceof BaseModel) {
		const model = ModelClass
		return {
			name: model.name,
			tableName: model.tableName ?? model.name,
			fields: convertAllModelFieldsFromClassToPojo(model.fields),
			relations: convertAllModelRelationsFromClassToPojo(ModelClass, getOne),
			disabled: model.disabled,
		}
	} else {
		return ModelClass
	}
}

function convertAllModelRelationsFromClassToPojo(
	model: BaseModel,
	getOne: ModelsState["getOne"],
): PojoModel["relations"] {
	const relations = model.getRelations()

	const expanded: Record<string, PojoModelRelation> = {}

	for (const [property, relation] of Object.entries(relations)) {
		const type = relation.options.type
		const otherSide = getOne(relation.modelFn())

		const otherSidePk =
			otherSide instanceof BaseModel
				? otherSide.getPkField()
				: Object.entries(otherSide.fields).find(([field, config]) => config.isPrimaryKey)?.[0]

		if (!otherSidePk) throw new ZmajOrmError("No PK")

		if (type === "many-to-one" || type === "owner-one-to-one") {
			expanded[property] = {
				type,
				field: relation.options.fkField,
				referencedField: relation.options.referencedField ?? otherSidePk,
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
			const junctionModel = getOne(relation.options.junction())
			expanded[property] = {
				type,
				field: model.getPkField(),
				junctionField: relation.options.fields[0],
				junctionReferencedField: relation.options.fields[1],
				junctionModel: junctionModel.name,
				referencedModel: otherSide.name,
				referencedField: otherSidePk,
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
