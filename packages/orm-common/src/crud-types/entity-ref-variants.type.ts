import { BaseModel, ModelType } from ".."
import { EntityRef } from "./entity-ref.type"

export type EntityRefVariants<T> =
	| EntityRef<T>
	| EntityRef<T>[] //
	| readonly EntityRef<T>[]
	| ModelType<BaseModel>
	| ModelType<BaseModel>[] //
	| readonly ModelType<BaseModel>[]
