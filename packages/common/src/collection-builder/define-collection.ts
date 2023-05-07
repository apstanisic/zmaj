import { CollectionDef } from "@common/modules/infra-collections/collection-def.type"
import { FieldDef } from "@common/modules/infra-fields/field-def.type"
import { Struct } from "@common/types/struct.type"
import { Class, ConditionalPick, Except, PartialDeep } from "type-fest"
import { BuildCollectionOptions, buildCollection } from "./_build-infra-collection"
import { buildField } from "./_build-field"
import { buildRelation, RelationBuilderInfo } from "./_build-relation"
import {
	BaseModel,
	ModelRelation,
	ModelRelationDefinition,
	ModelType,
	OnlyFields,
	OnlyRelations,
	createModelsStore,
} from "@zmaj-js/orm-common"
import { UserModel } from ".."

type FieldParams = Pick<FieldDef, "dataType"> & Partial<FieldDef>
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

function defineCollection<TModel extends BaseModel>(
	ModelClass: Class<TModel>,
	config: {
		options?: BuildCollectionOptions<ModelType<TModel>>
		fields?: PartialDeep<Record<keyof TModel["fields"], FieldParams>>
		relations?: PartialDeep<
			Record<keyof ConditionalPick<TModel, ModelRelationDefinition<any, any>>, { label: string }>
		>
	},
) {
	const created = models.has(ModelClass)
	if (!created) {
		models.set(ModelClass, new ModelClass())
	}
	const model = models.get(ModelClass)!
}

defineCollection(UserModel, {
	fields: { email: {} },
	relations: { authSessions: { label: "" } },
})
