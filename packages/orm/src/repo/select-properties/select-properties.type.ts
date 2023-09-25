import { RelationBuilderResult } from "@orm/model/relations/relation-builder-result"
import { ModelPropertyKeys } from "@orm/model/types/model-property-keys"
import { Simplify } from "type-fest"
import { BaseModel } from "../../model/base-model"

type All = { $fields?: true }
// It does not work without 2 NonNullable
// TODO Disable passing fields that user cannot read (unless includeHidden is passed)
// $fields is special key that means get me all fields. It is useful if we need to get some relation
// we do not have to specify all fields
// export type SelectFieldsOld<T extends BaseModel> = {
// 	[key in keyof ModelType<T>]?: NonNullable<NonNullable<ModelType<T>>[key]> extends ModelVariant<
// 		infer TRelation extends BaseModel
// 	>
// 		? SelectFieldsOld<TRelation> | true
// 		: true
// } // & All

export type SelectProperties<TModel extends BaseModel> = Simplify<
	{
		[key in ModelPropertyKeys<TModel>]?: key extends keyof TModel["fields"]
			? true
			: key extends keyof TModel
			? TModel[key] extends RelationBuilderResult<infer TInnerModel, any, any>
				? true | SelectProperties<TInnerModel>
				: never
			: never
	} & All
>
