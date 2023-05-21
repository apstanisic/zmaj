import { Class } from "type-fest"
import { DirectModel, M2M, ModelRelation } from "../config"
import { BaseModel } from "./BaseModel"
import { ModelRelationDefinition } from "./ModelRelationDefinition"

type Struct<T> = Record<string, T>

/**
 * @deprecated Do I need this
 */
export function expandModelRelations(
	modelClasses: Class<BaseModel>[],
	createdModels: Record<string, BaseModel> = {},
): Struct<Struct<ModelRelation>> {
	const models: Struct<BaseModel> = { ...createdModels }

	const toReturn: Struct<Struct<ModelRelation>> = {}
	for (const Model of modelClasses) {
		if (!models[Model.name]) {
			models[Model.name] = new Model()
		}
		const model = models[Model.name]!
		const modelRelations: Struct<ModelRelation> = {}
		toReturn[model.name] = modelRelations

		const relations = Object.entries(model).filter(
			([property, value]) => value instanceof ModelRelationDefinition,
		)
		for (const [relProperty, _relation] of relations) {
			const relation = _relation as ModelRelationDefinition<any>
			const RefModel = relation.modelFn()

			if (!models[RefModel.name]) {
				models[RefModel.name] = new RefModel()
			}
			const refModel = models[RefModel.name]!

			if (relation.options.type === "many-to-one" || relation.options.type === "owner-one-to-one") {
				const refField = Object.entries(refModel.fields).find(
					([_fieldName, options]) => options.isPk,
				)?.[0]
				if (!refField) throw new Error("Referenced model must have primary key")
				const rel: DirectModel = {
					type: relation.options.type,
					field: relation.options.fkField,
					referencedField: refField,
					referencedModel: refModel.name,
				}
				modelRelations[relProperty] = rel
			} else if (
				relation.options.type === "one-to-many" ||
				relation.options.type === "ref-one-to-one"
			) {
				const pkField = Object.entries(model.fields).find(
					([_fieldName, options]) => options.isPk,
				)?.[0]
				if (!pkField) throw new Error("Model must have primary key")
				const rel: DirectModel = {
					type: "one-to-many",
					field: pkField,
					referencedField: relation.options.fkField as string,
					referencedModel: refModel.name,
				}
				modelRelations[relProperty] = rel
			} else if (relation.options.type === "many-to-many") {
				const JunctionModel = relation.options.junction()
				if (!models[JunctionModel.name]) {
					models[JunctionModel.name] = new JunctionModel()
				}
				const junctionModel = models[JunctionModel.name]!

				const pkField = Object.entries(model.fields).find(
					([_fieldName, options]) => options.isPk,
				)?.[0]
				if (!pkField) throw new Error("Model must have primary key")

				const rightPkField = Object.entries(refModel.fields).find(
					([_fieldName, options]) => options.isPk,
				)?.[0]
				if (!rightPkField) throw new Error("Model must have primary key")

				const rel: M2M = {
					field: pkField,
					junctionField: relation.options.fields[0],
					junctionReferencedField: relation.options.fields[1],
					junctionModel: junctionModel.name,
					referencedField: rightPkField,
					referencedModel: refModel.name,
					type: "many-to-many",
				}
				modelRelations[relProperty] = rel
			}
		}
	}
	return toReturn
}
