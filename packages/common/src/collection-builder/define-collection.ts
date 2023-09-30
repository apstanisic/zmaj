import { CollectionDef } from "@common/modules/infra-collections/collection-def.type"
import { ColumnDataType } from "@common/modules/infra-fields/column-data-type.schema"
import { FieldDef } from "@common/modules/infra-fields/field-def.type"
import { BaseModel, ModelRelationKeys, ModelsState } from "@zmaj-js/orm"
import { Class, Except } from "type-fest"
import { v4 } from "uuid"
import { snakeCase } from ".."
import { buildField, buildFields } from "./_build-field"
import { BuildCollectionOptions, buildCollection } from "./_build-infra-collection"
import { RelationBuilderInfo, buildRelations } from "./_build-relation"

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

// type RelationKeys<TModel extends BaseModel> = keyof Record<
// 	keyof ConditionalPick<TModel, ModelRelationDefinition<any, any>>,
// 	{ label: string }
// >

export function codeCollection<TModel extends BaseModel>(
	ModelClass: Class<TModel>,
	config: {
		options?: BuildCollectionOptions
		fields?: Partial<Record<keyof TModel["fields"], FieldParams>>
		relations: Record<
			ModelRelationKeys<TModel>,
			Except<RelationBuilderInfo, "thisTableName" | "thisPropertyName">
		>
	},
): CollectionDef {
	const model = new ModelClass()
	const tableName = model.tableName ?? snakeCase(model.name)
	const col = buildCollection(tableName, config.options)

	return {
		...col,
		collectionName: model.name,
		fields: buildFields(model, config.fields),
		relations: buildRelations(model, config.relations),
	}
}

export function defineCollection<TModel extends BaseModel>(
	ModelClass: Class<TModel>,
	config: {
		// store: ModelsState
		options?: BuildCollectionOptions
		fields?: Partial<Record<keyof TModel["fields"], FieldParams>>
		relations?: Partial<
			Record<
				ModelRelationKeys<TModel>,
				{ label?: string; hidden?: boolean; otherPropertyName?: string }
			>
		>
	},
): (store: ModelsState) => CollectionDef {
	return (store) => {
		const model = store.getOneAsPojo(ModelClass)
		const tableName = model.tableName ?? model.name
		const col = buildCollection(tableName, config.options)

		for (const [property, field] of Object.entries(model.fields)) {
			// ts not working with .entries
			const additionalConfig = config.fields?.[property as keyof TModel["fields"]]

			const generated = buildField({
				tableName,
				...additionalConfig,
				...field,
				dataType: field.dataType as ColumnDataType, // TODO FIX THIS
				isPrimaryKey: field.isPrimaryKey,
				fieldName: property,
				columnName: field.columnName ?? snakeCase(property),
			})
			col.fields[property] = generated
		}

		const relations = model.relations
		for (const [property, rel] of Object.entries(relations)) {
			// FIXME: WHY IS THIS UNDEFINED
			const otherModelClass = rel.referencedModel

			const otherSideModel = store.getByNameAsPojo(otherModelClass)
			if (rel.type === "many-to-many") {
				//
			} else if (rel.type === "many-to-one" || rel.type === "owner-one-to-one") {
				//
				const columnName = model.fields[rel.field]?.columnName ?? snakeCase(rel.field)
				if (!columnName) throw new Error("49323 " + rel.field)
				//
				const otherField = rel.referencedField
				const otherColumnName =
					otherSideModel.fields[otherField]?.columnName ?? snakeCase(otherField)
				if (!otherColumnName) throw new Error("93930")
				//
				// const relConfig =
				// 	config.relations?.[property as keyof NonNullable<(typeof config)["relations"]>] ?? {}

				col.relations[property] = {
					type: rel.type,
					propertyName: property,
					collectionName: model.name,
					tableName,
					fieldName: rel.field,
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
						// ...relConfig,
					},
				}
				//
			} else {
				//
			}
		}
		return col

		// const relations = modelInstance.relations

		// for (const [property, rel] of Object.entries(relations)) {
		// 	// FIXME: WHY IS THIS UNDEFINED
		// 	const otherModelClass = rel.modelFn()
		// 	console.log({ tableName, property, otherModelClass, aa: rel.modelFn, all: rel })

		// 	const otherSideModel = models.getModel(otherModelClass)
		// 	if (rel.options.type === "many-to-many") {
		// 		//
		// 	} else if (rel.options.type === "many-to-one" || rel.options.type === "owner-one-to-one") {
		// 		//
		// 		const columnName =
		// 			modelInstance.fields[rel.options.fkField]?.columnName ?? rel.options.fkField
		// 		//
		// 		const otherField = rel.options.referencedField ?? otherSideModel.getPkField()
		// 		const otherColumnName = modelInstance.fields[otherField]?.columnName ?? otherField
		// 		//
		// 		const relConfig =
		// 			config.relations?.[property as keyof NonNullable<(typeof config)["relations"]>] ?? {}

		// 		col.relations[property] = {
		// 			type: rel.options.type,
		// 			propertyName: property,
		// 			collectionName: modelInstance.name,
		// 			tableName,
		// 			fieldName: rel.options.fkField,
		// 			columnName,
		// 			id: v4(),
		// 			otherSide: {
		// 				collectionName: otherSideModel.name,
		// 				tableName: otherSideModel.tableName ?? otherSideModel.name,
		// 				fieldName: otherField,
		// 				columnName: otherColumnName,
		// 			},
		// 			relation: {
		// 				createdAt: new Date(),
		// 				template: null,
		// 				label: null,
		// 				id: v4(),
		// 				mtmFkName: null,
		// 				propertyName: property,
		// 				tableName,
		// 				fkName: `fk_${tableName}_${property}`,
		// 				hidden: false,
		// 				...relConfig,
		// 			},
		// 		}
		// 		//
		// 	} else {
		// 		//
		// 	}

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
}
