import { OnlyFields } from "@common/modules/crud-types/only-fields.type"
import { OnlyRelations } from "@common/modules/crud-types/only-relations.type"
import { CollectionDef } from "@common/modules/infra-collections/collection-def.type"
import { FieldDef } from "@common/modules/infra-fields/field-def.type"
import { Struct } from "@common/types/struct.type"
import { buildField } from "./_build-field"
import { BuildCollectionOptions, buildCollection } from "./_build-infra-collection"
import { DefineRelationsParams, DefineSingleRelation, buildRelation2 } from "./_build-rel2"
import { buildRelation } from "./_build-relation"

type FieldParams = Pick<FieldDef, "dataType"> & Partial<FieldDef>
type DefineCollectionParams<T extends Struct> = {
	tableName: string
	options?: BuildCollectionOptions<T>
	fields: Record<keyof OnlyFields<T>, FieldParams>
	relations: DefineRelationsParams<T>
	// relations: Record<
	// 	keyof OnlyRelations<T>,
	// 	Except<RelationBuilderInfo, "thisTableName" | "thisPropertyName">
	// >
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
		const value = params.relations[property as keyof typeof params.relations]
		value.otherField
		const generated = buildRelation2(value, col.collectionName, property)
		// const generated = buildRelation({
		// 	...value,
		// 	thisPropertyName: property,
		// 	thisTableName: params.tableName,
		// })

		col.relations[property] = generated
	}

	return col
}
