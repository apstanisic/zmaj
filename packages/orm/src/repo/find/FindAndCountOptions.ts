import { BaseModel } from "@orm/model/base-model"
import { SelectProperties } from "../select-properties/select-properties.type"
import { FindManyOptions } from "./FindManyOptions"

export type FindAndCountOptions<
	TModel extends BaseModel,
	TFields extends SelectProperties<TModel> | undefined,
	TIncludeHidden extends boolean,
> = FindManyOptions<TModel, TFields, TIncludeHidden>
