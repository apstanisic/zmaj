import { BaseModel } from "@orm-engine/model/base-model"
import { ModelType } from "@orm-engine/model/types/extract-model-types"

/**
 * TODO Find better name. This checks if property is type of model, so we know it's relation
 */
export type ModelVariant<T extends BaseModel> =
	| ModelType<T>
	| ModelType<T>[] //
	| readonly ModelType<T>[]
