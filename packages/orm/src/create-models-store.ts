import { Class } from "type-fest"
import { BaseModel } from "./model/base-model"
import { PojoModel } from "./model/pojo-model"

type ModelParam = Class<BaseModel> | PojoModel

export type ModelsState = {
	models: Map<string, ModelParam>
	addMany: (model: ModelParam[]) => void
	getOne: (model: ModelParam) => ModelParam
	getAll: () => ModelParam[]
	removeAll: () => void
}

export function createModelsStore(models: ModelParam[] = []): ModelsState {
	const allModels = new Map<string, BaseModel | PojoModel>()

	function modelName(model: ModelParam): string {
		return typeof model === "function" ? model.name : model.name
	}

	function add(Model: ModelParam): void {
		if (Model === undefined) throw new Error("Provided model is undefined!")
		const name = modelName(Model)
		if (allModels.has(name)) return

		allModels.set(name, typeof Model === "function" ? new Model() : Model)
	}

	for (const model of models) {
		add(model)
	}

	return {
		models: allModels,
		setup: (models: ModelParam[]): void => {},
		addMany: (models: ModelParam[]): void => {
			for (const Model of models) {
				add(Model)
			}
		},
		getOne: (Model: ModelParam): ModelParam => {
			add(Model)
			return allModels.get(modelName(Model))
		},
		getAll: () => {
			return Array.from(allModels.values())
		},
		removeAll: (): void => {
			allModels.clear()
		},
	}
}
