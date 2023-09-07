import { Class } from "type-fest"
import { BaseModel } from "./model/base-model"

export type ModelsState<TModel extends BaseModel = BaseModel> = {
	models: Map<Class<BaseModel>, TModel>
	getModel: (model: Class<TModel>) => TModel
	getAll: () => TModel[]
	clear: () => void
	set: (model: Class<TModel>[]) => void
}

export function createModelsStore<TModel extends BaseModel = BaseModel>(): ModelsState<TModel> {
	const allModels = new Map()

	function add(Model: Class<BaseModel>): TModel {
		if (Model === undefined) throw new Error("Provided model is undefined!")
		if (allModels.has(Model)) {
			return allModels.get(Model)!
		} else {
			allModels.set(Model, new Model())
			return allModels.get(Model)!
		}
	}

	return {
		models: allModels,
		set: (models: Class<BaseModel>[]): void => {
			for (const Model of models) {
				add(Model)
			}
		},
		getModel: (Model: Class<BaseModel>): TModel => {
			return add(Model)
		},
		getAll: () => {
			return Array.from(allModels.values())
		},
		clear: (): void => {
			allModels.clear()
		},
	}
}
