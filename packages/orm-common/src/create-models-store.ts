import { Class } from "type-fest"
import { BaseModel } from "./model-builder/BaseModel"

export function createModelsStore<TModel extends BaseModel = BaseModel>(): Map<
	Class<BaseModel>,
	TModel
> {
	return new Map()
}
