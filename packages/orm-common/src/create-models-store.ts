import { Class } from "type-fest"
import { BaseModel } from "./model-builder/BaseModel"

type ModelsState<TModel extends BaseModel = BaseModel> = {
	models: Map<Class<BaseModel>, TModel>
	getModel: (model: Class<TModel>) => TModel
	clear: () => void
}

export function createModelsStore<TModel extends BaseModel = BaseModel>(): ModelsState<TModel> {
	const allModels = new Map()

	return {
		models: allModels,
		getModel: (Model: Class<BaseModel>): TModel => {
			if (Model === undefined) throw new Error("Provided model is undefined")
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
