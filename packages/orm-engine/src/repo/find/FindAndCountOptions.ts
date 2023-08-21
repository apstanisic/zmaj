import { SelectFields } from "@orm-engine/crud/select-fields.type"
import { BaseModel } from "@orm-engine/model/base-model"
import { FindManyOptions } from "./FindManyOptions"

export type FindAndCountOptions<
	TModel extends BaseModel,
	TFields extends SelectFields<TModel> | undefined,
	TIncludeHidden extends boolean,
> = FindManyOptions<TModel, TFields, TIncludeHidden>
