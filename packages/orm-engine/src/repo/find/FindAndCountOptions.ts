import { SelectFields } from "@orm-engine/crud/select-fields.type"
import { BaseModel } from "@orm-engine/model/base-model"
import { FindManyOptions } from "./FindManyOptions"

export type FindAndCountOptions<
	T extends BaseModel,
	F extends SelectFields<T> | undefined,
> = FindManyOptions<T, F>
