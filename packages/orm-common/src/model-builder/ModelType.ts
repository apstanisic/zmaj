import { StripWrapperTypes } from "@orm-common/strip-wrapper-types.type"
import { ConditionalPick } from "type-fest"
import { BaseModel } from "./BaseModel"
import { ModelRelationDefinition } from "./ModelRelationDefinition"
import { ExtractFields } from "./field-builder"

type OnlyModelRelations<TModel extends BaseModel> = ConditionalPick<
	TModel,
	ModelRelationDefinition<any>
>

export type ModelRelations<TModel extends BaseModel> = {
	[key in keyof OnlyModelRelations<TModel>]?: TModel[key] extends ModelRelationDefinition<
		infer TInner,
		infer TType
	>
		? TType extends false
			? ModelType<TInner>
			: ModelType<TInner>[]
		: never // ModelType<R> : never
}

// From https://stackoverflow.com/a/74652723
type UndefinedProperties<T> = {
	[P in keyof T]-?: undefined extends T[P] ? P : never
}[keyof T]

// Convert from `val | undefined` to `?: val | undefined`
type ToOptional<T> = Partial<Pick<T, UndefinedProperties<T>>> &
	Pick<T, Exclude<keyof T, UndefinedProperties<T>>>

type BaseType<TModel extends BaseModel> = ToOptional<ExtractFields<TModel["fields"]>> &
	ModelRelations<TModel>

export type ModelType<TModel extends BaseModel> = StripWrapperTypes<BaseType<TModel>>
