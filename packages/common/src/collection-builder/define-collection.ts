import { CollectionDef } from "@common/modules/infra-collections/collection-def.type"
import { ColumnDataType } from "@common/modules/infra-fields/column-data-type.schema"
import { FieldDef } from "@common/modules/infra-fields/field-def.type"
import { snakeCase } from "@common/utils/lodash"
import { BaseModel, ModelRelationKeys, createModelsStore } from "@zmaj-js/orm"
import { Class, Except } from "type-fest"
import { v4 } from "uuid"
import { buildField } from "./_build-field"
import { BuildCollectionOptions, buildCollection } from "./_build-infra-collection"

type FieldParams = Except<Partial<FieldDef>, "dataType">
type DefineCollectionParams = {
	tableName: string
	options?: BuildCollectionOptions
	// fields: Record<keyof GetModelFields<T>, FieldParams>
	// relations: Record<
	// 	keyof OnlyRelations<T>,
	// 	Except<RelationBuilderInfo, "thisTableName" | "thisPropertyName">
	// >
}

/**
 * Define Collection. Used for defining collection in code, for system collections
 */
// export function DefineCollection<T extends Struct = Struct>(
// 	params: DefineCollectionParams<T>,
// ): CollectionDef<T> {
// 	const col = buildCollection<T>(params.tableName, params.options)
// 	for (const property of Object.keys(params.fields)) {
// 		// ts not working with .entries
// 		const value = params.fields[property as keyof OnlyFields<T>]
// 		const generated = buildField({
// 			tableName: params.tableName,
// 			fieldName: String(property),
// 			...value,
// 		})
// 		col.fields[property] = generated
// 	}

// 	for (const property of Object.keys(params.relations)) {
// 		// ts not working with .entries
// 		const value = params.relations[property as keyof OnlyRelations<T>]
// 		const generated = buildRelation({
// 			...value,
// 			thisPropertyName: property,
// 			thisTableName: params.tableName,
// 		})

// 		col.relations[property] = generated
// 	}

// 	return col
// }

let models = createModelsStore()
// const models = createModelsStore()

// type RelationKeys<TModel extends BaseModel> = keyof Record<
// 	keyof ConditionalPick<TModel, ModelRelationDefinition<any, any>>,
// 	{ label: string }
// >

export function defineCollection<TModel extends BaseModel>(
	ModelClass: Class<TModel>,
	config: {
		options?: BuildCollectionOptions
		fields?: Partial<Record<keyof TModel["fields"], FieldParams>>
		relations?: Partial<
			Record<
				ModelRelationKeys<TModel>,
				{ label?: string; hidden?: boolean; otherPropertyName?: string }
			>
		>
	},
): CollectionDef {
	models ??= createModelsStore()
	const modelInstance = models.getModel(ModelClass)
	const tableName = modelInstance.tableName ?? snakeCase(modelInstance.name)
	const col = buildCollection(tableName, config.options)

	for (const [property, field] of Object.entries(modelInstance.fields)) {
		// ts not working with .entries
		const additionalConfig = config.fields?.[property as keyof TModel["fields"]]
		const generated = buildField({
			tableName,
			fieldName: property,
			...additionalConfig,
			...field,
			dataType: field.dataType as ColumnDataType, // TODO FIX THIS
			isPrimaryKey: field.isPk,
		})
		col.fields[property] = generated
	}

	const a = 2 + 2 == 4
	if (a) return col

	const relations = modelInstance.getRelations()

	for (const [property, rel] of Object.entries(relations)) {
		// FIXME: WHY IS THIS UNDEFINED
		const otherModelClass = rel.modelFn()
		console.log({ tableName, property, otherModelClass, aa: rel.modelFn, all: rel })

		const otherSideModel = models.getModel(otherModelClass)
		if (rel.options.type === "many-to-many") {
			//
		} else if (rel.options.type === "many-to-one" || rel.options.type === "owner-one-to-one") {
			//
			const columnName =
				modelInstance.fields[rel.options.fkField]?.columnName ?? rel.options.fkField
			//
			const otherField = rel.options.referencedField ?? otherSideModel.getPkField()
			const otherColumnName = modelInstance.fields[otherField]?.columnName ?? otherField
			//
			const relConfig =
				config.relations?.[property as keyof NonNullable<(typeof config)["relations"]>] ?? {}

			col.relations[property] = {
				type: rel.options.type,
				propertyName: property,
				collectionName: modelInstance.name,
				tableName,
				fieldName: rel.options.fkField,
				columnName,
				id: v4(),
				otherSide: {
					collectionName: otherSideModel.name,
					tableName: otherSideModel.tableName ?? otherSideModel.name,
					fieldName: otherField,
					columnName: otherColumnName,
				},
				relation: {
					createdAt: new Date(),
					template: null,
					label: null,
					id: v4(),
					mtmFkName: null,
					propertyName: property,
					tableName,
					fkName: `fk_${tableName}_${property}`,
					hidden: false,
					...relConfig,
				},
			}
			//
		} else {
			//
		}

		// We have to extract all data that is provided as RelationDef so admin panel can
		// generate fields
		// ALSO FOR CAN_READ, ADD ADDITIONAL PROPERTY THAT WILL NOT BE MODIFIED IF CAN_READ is false
		// const otherSide = models.getModel(relationDef.modelFn())
		// relations['hello']?.options.type === ''
		// ts not working with .entries
		// const value = config.relations?.[property as never]
		// const generated = buildRelation({
		// 	type: relationDef.options.type,
		// 	thisPropertyName: property,
		// 	// : otherSide.name
		// 	// ...value,
		// 	// thisPropertyName: property,
		// 	// thisTableName: tableName,
		// })
		// col.relations[property] = generated
	}
	// throw new Error("You need to fix me ")
	return col
}

/**
 *
 * class UserModel extends BaseModel {}
 *
 * defineCollection(UserModel)
 *
 * From DB
 *
 * =>
 *
 * PojoModel
 *
 * CollectionDef
 *
 *
 *
 *
 */

/**
 * What does defineCollection do. It converts UserModel to CollectionDef
 */
