import { Class } from "type-fest"
import { BaseModel } from "./model-builder/BaseModel"

type ModelsState<TModel extends BaseModel = BaseModel> = {
	models: Map<Class<BaseModel>, TModel>
	get: (model: Class<TModel>) => TModel
	clear: () => void
}

export function createModelsStore<TModel extends BaseModel = BaseModel>(): ModelsState<TModel> {
	const allModels = new Map()

	return {
		models: allModels,
		get: (Model: Class<BaseModel>): TModel => {
			if (allModels.has(Model)) {
				return allModels.get(Model)!
			} else {
				allModels.set(Model, new Model())
				return allModels.get(Model)!
			}
		},
		clear: (): void => {
			allModels.clear()
		},
	}
}
