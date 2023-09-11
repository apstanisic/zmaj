import { Class } from "type-fest"
import { BaseModel } from "./model/base-model"
import { baseModelToPojoModel } from "./model/base-model-to-pojo-model"
import { PojoModel } from "./model/pojo-model"

type ModelParam = Class<BaseModel> | PojoModel

export type ModelsState = {
	models: Map<string, BaseModel | PojoModel>
	init: (model: ModelParam[]) => PojoModel[]
	getOne: (model: ModelParam) => PojoModel | BaseModel
	getOneAsPojo: (model: ModelParam) => PojoModel
	getAllAsPojo: () => PojoModel[]
	removeAll: () => void
}

export function createModelsStore(models: ModelParam[] = []): ModelsState {
	const allModels = new Map<string, BaseModel | PojoModel>()
	const pojoModels = new Map<string, PojoModel>()

	function modelName(model: ModelParam): string {
		return typeof model === "function" ? model.name : model.name
	}

	function addIfMissing(Model: ModelParam): void {
		if (Model === undefined) throw new Error("Provided model is undefined!")
		const name = modelName(Model)
		if (allModels.has(name)) return

		allModels.set(name, typeof Model === "function" ? new Model() : Model)
	}

	function getOne(model: ModelParam): BaseModel | PojoModel {
		addIfMissing(model)
		return allModels.get(modelName(model))!
	}

	for (const model of models) {
		addIfMissing(model)
	}

	return {
		models: allModels,
		init: (models: ModelParam[]): PojoModel[] => {
			allModels.clear()
			for (const model of models) {
				addIfMissing(model)
			}
			for (const [name, model] of allModels.entries()) {
				pojoModels.set(name, baseModelToPojoModel(model, getOne))
			}
			return Array.from(pojoModels.values())
		},
		getOne: (model: ModelParam) => {
			addIfMissing(model)
			return allModels.get(modelName(model))!
		},
		getOneAsPojo: (model: ModelParam) => {
			addIfMissing(model)
			return pojoModels.get(modelName(model))!
		},
		getAllAsPojo: () => {
			return Array.from(pojoModels.values())
		},
		removeAll: (): void => {
			allModels.clear()
		},
	}
}
