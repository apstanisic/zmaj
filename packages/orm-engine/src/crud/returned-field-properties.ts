import { BaseModel } from "@orm-engine/model/base-model"
import { GetReadFields } from "@orm-engine/model/types/extract-model-fields.types"
import { Base } from "@orm-engine/model/utils/base.type"
import { SelectFields } from "./select-fields.type"

export type ReturnedFieldProperties<
	TModel extends BaseModel,
	TFields extends SelectFields<TModel> | undefined,
	TAddHidden extends boolean,
> = Base<{
	[key in keyof Required<GetReadFields<TModel, TAddHidden>>]: key extends keyof NonNullable<TFields>
		? NonNullable<TFields>[key] extends true
			? GetReadFields<TModel, TAddHidden>[key]
			: GetReadFields<TModel, TAddHidden>[key] | undefined
		: Required<GetReadFields<TModel, TAddHidden>>[key] | undefined
}>

export type HandleReturnField<
	TModel extends BaseModel,
	TFields extends SelectFields<TModel> | undefined,
	TAddHidden extends boolean,
	TKey,
> = TKey extends keyof GetReadFields<TModel, TAddHidden>
	? TKey extends keyof NonNullable<TFields>
		? NonNullable<TFields>[TKey] extends true
			? GetReadFields<TModel, TAddHidden>[TKey]
			: GetReadFields<TModel, TAddHidden>[TKey] | undefined
		: Required<GetReadFields<TModel, TAddHidden>>[TKey] | undefined
	: never