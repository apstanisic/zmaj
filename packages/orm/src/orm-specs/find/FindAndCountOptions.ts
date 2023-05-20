import { BaseModel, Fields, ModelType } from "@zmaj-js/orm-common"
import { FindManyOptions } from "./FindManyOptions"

export type FindAndCountOptions<
	T extends BaseModel,
	F extends Fields<ModelType<T>> | undefined,
> = FindManyOptions<T, F>
