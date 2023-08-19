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
export class ModelRelationDefinition<
	T extends BaseModel,
	_IsToManyRelation extends boolean = false,
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
