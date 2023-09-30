import { NameTransformer } from "@orm/NameTransformer"
import { ZmajOrmError } from "@orm/orm-errors"
import { BaseModel } from "./base-model"
import { PojoModel, PojoModelField, PojoModelRelation } from "./pojo-model"

/**
 * This converts BaseModel class to plain object model, that will be consumed by underlying engine
 */
export function baseModelToPojoModel(
	ModelClass: BaseModel | PojoModel,
	allModels: (BaseModel | PojoModel)[],
	transformer?: NameTransformer,
): PojoModel {
	if (!(ModelClass instanceof BaseModel)) return ModelClass

	const model = ModelClass
	const fields = convertAllModelFieldsFromClassToPojo(model.fields, transformer)
	const fieldsArr = Object.entries(fields)
	const updatedAtField = fieldsArr.find(([_, config]) => config.isUpdatedAt)?.[0] ?? null
	const createdAtField = fieldsArr.find(([_, config]) => config.isCreatedAt)?.[0] ?? null

	return {
		isPojoModel: true,
		name: model.name,
		tableName: model.tableName ?? model.name,
		idField: model.getPkField(),
		fields,
		updatedAtField,
		createdAtField,
		relations: convertAllModelRelationsFromClassToPojo(ModelClass, allModels),
		disabled: model.disabled,
	}
}

function convertAllModelRelationsFromClassToPojo(
	model: BaseModel,
	allModels: (BaseModel | PojoModel)[],
): PojoModel["relations"] {
	const relations = model.getRelations()

	const expanded: Record<string, PojoModelRelation> = {}

	for (const [property, relation] of Object.entries(relations)) {
		const type = relation.options.type
		const otherSideModel = new (relation.modelFn())() as BaseModel
		const otherSide = allModels.find((m) => m.name === otherSideModel.name)
		if (!otherSide) throw new ZmajOrmError("No other side")

		const otherSidePk =
			otherSide instanceof BaseModel ? otherSide.getPkField() : otherSide.idField

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
			const junctionModel = new (relation.options.junction())()
			// const junction = allModels.find(am => am.name === junctionModelRelation.name)
			// const junctionModel = getOne(relation.options.junction())
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
	transformer?: NameTransformer,
): Record<string, PojoModelField> {
	const fieldEntries = Object.entries(fields).map(([fieldName, field]) => {
		return [fieldName, convertModelFieldFromClassToPojo(fieldName, field, transformer)]
	})
	return Object.fromEntries(fieldEntries)
}

function convertModelFieldFromClassToPojo(
	fieldName: string,
	field: BaseModel["fields"][string],
	transformer?: NameTransformer,
): PojoModelField {
	return {
		fieldName,
		dataType: field.dataType,
		canCreate: field.canCreate,
		canUpdate: field.canUpdate,
		canRead: field.canRead,
		columnName:
			field.columnName ?? transformer?.({ key: fieldName, type: "column" }) ?? fieldName,
		hasDefaultValue: field.hasDefault,
		isAutoIncrement: field.isAutoIncrement,
		isNullable: field.nullable,
		isPrimaryKey: field.isPk,
		isCreatedAt: field.isCreatedAt,
		isUnique: field.isUnique,
		isUpdatedAt: field.isUpdatedAt,
	}
}
