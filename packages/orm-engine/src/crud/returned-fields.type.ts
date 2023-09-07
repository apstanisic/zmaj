import { BaseModel } from "@orm-engine/model/base-model"
import { ModelRelationDefinition } from "@orm-engine/model/relations/relation-metadata"
import { ModelType, ModelTypeWithHidden } from "@orm-engine/model/types/extract-model-types"
import { Base } from "@orm-engine/model/utils/base.type"
import { EmptyObject, UnwrapOpaque } from "type-fest"
import { tag } from "type-fest/source/opaque"
import { ModelVariant } from "./model-variant.type"
import { SelectFields } from "./select-fields.type"

// Check if type is array. Strips null and undefined
type IsArray<T> = NonNullable<T> extends any[] ? true : false

// Make type array is `Is` is `true`
type MakeArrayIf<Is extends boolean, T> = Is extends true ? T[] : T

type ShowHidden<T extends boolean> = T extends true ? "default" : "read"

// Maybe split this into fields section + relations. This way we can check fields part without
// messing with TS for relations
export type ReturnedFields<
	TModel extends BaseModel,
	TFields extends SelectFields<TModel> | undefined,
	TIncludeHidden extends boolean = false,
> = Omit<
	Base<
		TFields extends undefined | EmptyObject
			? UnwrapOpaque<ModelTypeWithHidden<TModel, TIncludeHidden>>
			: UnwrapOpaque<{
					[key in keyof Required<ModelType<TModel>>]: NonNullable<TFields>[key] extends true // if true, simply return required type
						? ModelTypeWithHidden<TModel, TIncludeHidden>
						: NonNullable<TFields>[key] extends object // if select object, pick fields
						? // keep type array if it's array relation
						  NonNullable<ModelType<TModel>[key]> extends ModelVariant<infer R extends BaseModel>
							?
									| MakeArrayIf<
											IsArray<NonNullable<ModelType<TModel, ShowHidden<TIncludeHidden>>[key]>>,
											ReturnedFields<R, NonNullable<TFields>[key]>
									  >
									| IsFieldInRelationNullable<key, TModel>
							: NonNullable<ModelTypeWithHidden<TModel, TIncludeHidden>[key]>
						: ModelTypeWithHidden<TModel, TIncludeHidden>[key] | undefined // otherwise return current type but make in optional
			  }>
	>,
	typeof tag // temp workaround for Opaque until i figure out why it's not working
>

type GetTypeFromKey<
	TModel extends BaseModel,
	TProperty extends keyof ModelType<TModel>,
	TIncludeHidden extends boolean,
> = ModelTypeWithHidden<TModel, TIncludeHidden>[TProperty]

export type IsFieldInRelationNullable<TKey, TModel extends BaseModel> = TKey extends keyof TModel
	? TModel[TKey] extends ModelRelationDefinition<any, any, infer FKey>
		? FKey extends string
			? FKey extends keyof TModel["fields"]
				? TModel["fields"][FKey]["_nullable"] extends true
					? undefined
					: never
				: never
			: never
		: never
	: never

if (import.meta.vitest) {
	//
}
