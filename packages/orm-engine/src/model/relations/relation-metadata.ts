import { Class } from "type-fest"
import { BaseModel } from "../base-model"
import { RelationType } from "./relation.type"

export type ManyToOneParams = {
	fkField: string
	referencedField?: string
	type: Extract<RelationType, "many-to-one" | "owner-one-to-one">
}

export type OneToManyParams = {
	fkField: string
	referencedField?: string
	type: Extract<RelationType, "one-to-many" | "ref-one-to-one">
}

export type ManyToManyParams = {
	type: Extract<RelationType, "many-to-many">
	junction: () => Class<BaseModel>
	fields: [string, string]
}

export class ModelRelationDefinition<
	TReferencedModel extends BaseModel,
	TIsToManyRelation extends boolean = false,
	TColumnName = undefined,
	TRelType extends RelationType = RelationType,
> {
	constructor(
		modelFn: () => Class<TReferencedModel>,
		params: ManyToOneParams | OneToManyParams | ManyToManyParams,
	) {
		this.options = params
		this.modelFn = modelFn
	}
	options: ManyToOneParams | OneToManyParams | ManyToManyParams
	modelFn: () => Class<TReferencedModel>
}

export class RelationBuilderResult<
	TReferencedModel extends BaseModel,
	TRelationType extends RelationType,
	TFkColumnName = undefined,
> {
	constructor(
		modelFn: () => Class<TReferencedModel>,
		params: ManyToOneParams | OneToManyParams | ManyToManyParams,
	) {
		this.options = params
		this.modelFn = modelFn
	}
	options: ManyToOneParams | OneToManyParams | ManyToManyParams
	modelFn: () => Class<TReferencedModel>
}
