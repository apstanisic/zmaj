import { Class } from "type-fest"
import { NameTransformer } from "./NameTransformer"
import { BaseModel } from "./model/base-model"
import { baseModelToPojoModel } from "./model/base-model-to-pojo-model"
import { PojoModel } from "./model/pojo-model"
import { ZmajOrmError } from "./orm-errors"

type ModelParam = Class<BaseModel> | PojoModel

export type ModelsState = {
	models: Map<string, PojoModel>
	init: (model: ModelParam[]) => PojoModel[]
	getOneAsPojo: (model: ModelParam) => PojoModel
	getAllAsPojo: () => PojoModel[]
	getByNameAsPojo: (name: string) => PojoModel
	removeAll: () => void
}

export function createModelsStore(config?: { nameTransformer?: NameTransformer }): ModelsState {
	const pojoModels = new Map<string, PojoModel>()

	function modelName(model: ModelParam): string {
		return typeof model === "function" ? new model().name : model.name
	}

	return {
		models: pojoModels,
		init: (models: ModelParam[]): PojoModel[] => {
			pojoModels.clear()
			// for (const model of models) {
			// 	addIfMissing(model)
			// }
			const instances = models.map((Model) =>
				typeof Model === "function" ? new Model() : Model,
			)
			for (const model of instances) {
				pojoModels.set(
					model.name,
					baseModelToPojoModel(model, instances, config?.nameTransformer),
				)
			}
			// console.log(JSON.stringify(Array.from(pojoModels.values()), null, 4))

			return Array.from(pojoModels.values())
		},
		getOneAsPojo: (model: ModelParam) => {
			// addIfMissing(model)
			const item = pojoModels.get(modelName(model))!
			if (!item) throw new ZmajOrmError("Model missing")
			return item
		},
		// TEMP
		getByNameAsPojo: (name: string) => {
			for (const [_name, model] of pojoModels.entries()) {
				if (name === model.name) return model
			}
			// const model = pojoModels.get(name)
			throw new ZmajOrmError(`No model ${name}`, 4099)
		},
		getAllAsPojo: () => {
			return Array.from(pojoModels.values())
		},
		removeAll: (): void => {
			pojoModels.clear()
		},
	}
}
