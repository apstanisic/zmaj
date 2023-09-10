import { Class } from "type-fest"
import { BaseModel } from "../base-model"
import { RelationType } from "./relation-type.types"

type ManyToOneParams<TFkField extends string | number | symbol | undefined> = {
	fkField: NonNullable<TFkField>
	referencedField?: string
	type: Extract<RelationType, "many-to-one" | "owner-one-to-one">
}

type OneToManyParams = {
	fkField: string
	referencedField?: string
	type: Extract<RelationType, "one-to-many" | "ref-one-to-one">
}

type ManyToManyParams = {
	type: Extract<RelationType, "many-to-many">
	junction: () => Class<BaseModel>
	fields: [string, string]
}

export class RelationBuilderResult<
	TReferencedModel extends BaseModel,
	TRelationType extends RelationType,
	TFkColumnName extends string | number | symbol | undefined,
> {
	constructor(
		modelFn: () => Class<TReferencedModel>,
		params: TRelationType extends ManyToManyParams["type"]
			? ManyToManyParams
			: TRelationType extends OneToManyParams["type"]
			? OneToManyParams
			: TRelationType extends ManyToOneParams<TFkColumnName>["type"]
			? ManyToOneParams<TFkColumnName>
			: never,
	) {
		this.options = params
		this.modelFn = modelFn
	}
	options: ManyToOneParams<TFkColumnName> | OneToManyParams | ManyToManyParams
	modelFn: () => Class<TReferencedModel>
}
