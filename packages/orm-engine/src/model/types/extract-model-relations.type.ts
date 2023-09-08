import { ConditionalExcept, ConditionalPick, Opaque } from "type-fest"
import { assertType, it } from "vitest"
import { CommentModel, PostInfoModel, PostModel, TagModel, WriterModel } from "../../example-models"
import { BaseModel } from "../base-model"
import { ModelRelationDefinition } from "../relations/relation-metadata"
import { Base } from "../utils/base.type"
import { ModelType } from "./extract-model-types"

type GetRelationProperties<TModel extends BaseModel> = ConditionalPick<
	TModel,
	ModelRelationDefinition<any>
>

type GetRelations<TModel extends BaseModel, TIsArray extends boolean> = {
	[key in keyof TModel]: NonNullable<TModel[key]> extends ModelRelationDefinition<
		infer TInner,
		infer TArray,
		any
	>
		? TArray extends TIsArray
			? TInner
			: never
		: never
}

export type DirectRelationModels<TModel extends BaseModel> = Base<
	ConditionalExcept<GetRelations<TModel, false>, never | undefined>
>
export type ArrayRelationModels<TModel extends BaseModel> = Base<
	ConditionalExcept<GetRelations<TModel, true>, never | undefined>
>

export type ExtractRelations<TModel extends BaseModel> = {
	[key in keyof GetRelationProperties<TModel>]?: TModel[key] extends ModelRelationDefinition<
		infer TInner,
		infer TType
	>
		? TType extends false
			? Opaque<ModelType<TInner>>
			: ModelType<TInner>[]
		: never // ModelType<R> : never
}

export type GetRelationModels<TModel extends BaseModel> = {
	[key in keyof GetRelationProperties<TModel>]: TModel[key] extends ModelRelationDefinition<
		infer TInnerModel,
		infer TIsArray
	>
		? TIsArray extends false
			? TInnerModel
			: TInnerModel[]
		: never
}

if (import.meta.vitest) {
	//
	it("extract only relations", () => {
		const postType = {} as ExtractRelations<PostModel>
		assertType<{
			comments?: ModelType<CommentModel>[]
			tags?: ModelType<TagModel>[]
			info?: ModelType<PostInfoModel>
			writer?: ModelType<WriterModel>
		}>(postType)

		const typeComment = {} as ExtractRelations<CommentModel>
		assertType<{
			post?: ModelType<PostModel> | undefined
		}>(typeComment)
	})
}
