import { BaseModel } from "@orm/model/base-model"
import { GetReadFields } from "@orm/model/types/get-model-fields.types"
import { Base } from "@orm/model/utils/base.type"
import { SelectProperties } from "../select-properties/select-properties.type"

export type ReturnedFieldProperties<
	TModel extends BaseModel,
	TFields extends SelectProperties<TModel> | undefined,
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
	TFields extends SelectProperties<TModel> | undefined,
	TAddHidden extends boolean,
	TKey,
	T$Fields extends boolean,
> = T$Fields extends true
	? TKey extends keyof GetReadFields<TModel, TAddHidden>
		? GetReadFields<TModel, TAddHidden>[TKey]
		: never
	: TKey extends keyof GetReadFields<TModel, TAddHidden>
	? TKey extends keyof NonNullable<TFields>
		? NonNullable<TFields>[TKey] extends true
			? GetReadFields<TModel, TAddHidden>[TKey]
			: never //GetReadFields<TModel, TAddHidden>[TKey] | undefined
		: never // Required<GetReadFields<TModel, TAddHidden>>[TKey] | undefined
	: never
