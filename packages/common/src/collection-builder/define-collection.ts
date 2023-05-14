import { CollectionDef } from "@common/modules/infra-collections/collection-def.type"
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
import { UserModel, snakeCase } from ".."
import { buildField } from "./_build-field"
import { BuildCollectionOptions, buildCollection } from "./_build-infra-collection"
import { RelationBuilderInfo, buildRelation } from "./_build-relation"

type FieldParams = Partial<FieldDef>
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
export function DefineCollection<T extends Struct = Struct>(
	params: DefineCollectionParams<T>,
): CollectionDef<T> {
	const col = buildCollection<T>(params.tableName, params.options)
	for (const property of Object.keys(params.fields)) {
		// ts not working with .entries
		const value = params.fields[property as keyof OnlyFields<T>]
		const generated = buildField({
			tableName: params.tableName,
			fieldName: String(property),
			...value,
		})
		col.fields[property] = generated
	}

	for (const property of Object.keys(params.relations)) {
		// ts not working with .entries
		const value = params.relations[property as keyof OnlyRelations<T>]
		const generated = buildRelation({
			...value,
			thisPropertyName: property,
			thisTableName: params.tableName,
		})

		col.relations[property] = generated
	}

	return col
}

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
): any {
	const modelInstance = models.get(ModelClass)
	const tableName = modelInstance.tableName ?? snakeCase(modelInstance.name)
	const col = buildCollection<ModelType<TModel>>(tableName, config.options)

	for (const property of Object.keys(modelInstance.fields)) {
		// ts not working with .entries
		const additionalConfig = config.fields?.[property as keyof TModel["fields"]]
		const generated = buildField({
			tableName,
			fieldName: property,
			...additionalConfig,
			...modelInstance.fields[property],
		})
		col.fields[property] = generated
	}

	const relations = modelInstance.getRelations()
	for (const [property, relationDef] of Object.entries(relations)) {
		const otherSide = models.get(relationDef.modelFn())
		// relations['hello']?.options.type === ''
		// ts not working with .entries
		const value = config.relations?.[property as never]
		const generated = buildRelation({
			type: relationDef.options.type,
			thisPropertyName: property,
			// : otherSide.name
			// ...value,
			// thisPropertyName: property,
			// thisTableName: tableName,
		})

		col.relations[property] = generated
	}
}

defineCollection(UserModel, {
	fields: { email: {} },
	relations: { authSessions: { label: "" } },
})
