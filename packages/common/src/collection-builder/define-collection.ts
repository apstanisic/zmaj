import { FieldDef } from "@common/modules/infra-fields/field-def.type"
import { Struct } from "@common/types/struct.type"
import {
	BaseModel,
	ModelRelationDefinition,
	ModelType,
	OnlyFields,
	OnlyRelations,
	createModelsStore,
} from "@zmaj-js/orm-common"
import { Class, ConditionalPick, Except } from "type-fest"
import { CollectionDef, ColumnDataType, snakeCase } from ".."
import { buildField } from "./_build-field"
import { BuildCollectionOptions, buildCollection } from "./_build-infra-collection"
import { RelationBuilderInfo } from "./_build-relation"

type FieldParams = Except<Partial<FieldDef>, "dataType">
type DefineCollectionParams<T extends Struct> = {
	tableName: string
	options?: BuildCollectionOptions<T>
	fields: Record<keyof OnlyFields<T>, FieldParams>
	relations: Record<
		keyof OnlyRelations<T>,
		Except<RelationBuilderInfo, "thisTableName" | "thisPropertyName">
	>
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

const models = createModelsStore()

// type RelationKeys<TModel extends BaseModel> = keyof Record<
// 	keyof ConditionalPick<TModel, ModelRelationDefinition<any, any>>,
// 	{ label: string }
// >

export function defineCollection<TModel extends BaseModel>(
	ModelClass: Class<TModel>,
	config: {
		options?: BuildCollectionOptions<ModelType<TModel>>
		fields?: Partial<Record<keyof TModel["fields"], FieldParams>>
		relations?: Partial<
			Record<
				keyof ConditionalPick<TModel, ModelRelationDefinition<any, any>>,
				{ label?: string; hidden?: boolean; otherPropertyName?: string }
			>
		>
	},
): CollectionDef<ModelType<TModel>> {
	const modelInstance = models.getModel(ModelClass)
	const tableName = modelInstance.tableName ?? snakeCase(modelInstance.name)
	const col = buildCollection<ModelType<TModel>>(tableName, config.options)

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

	const relations = modelInstance.getRelations()
	for (const [property, relationDef] of Object.entries(relations)) {
		// We have to extract all data that is provided as RelationDef so admin panel can
		// generate fields
		throw new Error("You need to fix me ")
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
	return col
}
