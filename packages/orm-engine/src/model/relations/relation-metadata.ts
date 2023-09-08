import { Class } from "type-fest"
import { BaseModel } from "../base-model"

export type ManyToOneParams = {
	fkField: string
	referencedField?: string
	type: "many-to-one" | "owner-one-to-one"
}

export type OneToManyParams = {
	fkField: string
	referencedField?: string
	type: "one-to-many" | "ref-one-to-one"
}

export type ManyToManyParams = {
	type: "many-to-many"
	junction: () => Class<BaseModel>
	fields: [string, string]
}
type RelType = (ManyToOneParams | OneToManyParams | ManyToManyParams)["type"]
export class ModelRelationDefinition<
	T extends BaseModel,
	_IsToManyRelation extends boolean = false,
	TColumnName = undefined,
	TRelType extends RelType = RelType,
> {
	constructor(
		modelFn: () => Class<T>,
		params: ManyToOneParams | OneToManyParams | ManyToManyParams,
	) {
		this.options = params
		this.modelFn = modelFn
	}
	options: ManyToOneParams | OneToManyParams | ManyToManyParams
	modelFn: () => Class<T>
}

// type RelType = "o2m" | "m2o" | "m2m" | "owner-o2o" | "ref-o2o"

// type Params = {
// 	referencedModel: BaseModel
// 	fkColumn?: string
// 	type: RelType
// 	isArray: boolean
// }

// type Options<TType extends RelType> = TType extends "m2o" | "owner-o2o"
// 	? ManyToOneParams
// 	: TType extends "o2m" | "ref-o2o"
// 	? OneToManyParams
// 	: ManyToManyParams

// class ModelRelationInfo<const TParams extends Params> {
// 	constructor(modelFn: () => Class<TParams["referencedModel"]>, params: Options<TParams["type"]>) {
// 		this.options = params
// 		this.modelFn = modelFn
// 	}
// 	options: Options<TParams["type"]>
// 	modelFn: () => Class<TParams["referencedModel"]>
// }
