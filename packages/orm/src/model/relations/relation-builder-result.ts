import { Class } from "type-fest"
import { BaseModel } from "../base-model"
import { RelationType } from "./relation-type.types"

type ManyToOneParams<TFkField extends string | number | symbol | undefined> = {
	fkField: NonNullable<TFkField>
	referencedField?: string
	type: "many-to-one" | "owner-one-to-one"
}

type OneToManyParams = {
	fkField: string
	referencedField?: string
	type: "one-to-many" | "ref-one-to-one"
}

type ManyToManyParams = {
	type: "many-to-many"
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
		params: any,
		// TRelationType["type"] extends ManyToManyParams["type"]
		// 	? ManyToManyParams
		// 	: TRelationType["type"] extends OneToManyParams["type"]
		// 	? OneToManyParams
		// 	: TRelationType["type"] extends ManyToOneParams<TFkColumnName>["type"]
		// 	? ManyToOneParams<TFkColumnName>
		// 	: never,
	) {
		this.options = params
		this.modelFn = modelFn
	}
	options: ManyToOneParams<TFkColumnName> | OneToManyParams | ManyToManyParams
	modelFn: () => Class<TReferencedModel>
}
