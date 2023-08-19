import { ConditionalPick, Opaque } from "type-fest"
import { assertType, it } from "vitest"
import { CommentModel, PostInfoModel, PostModel, TagModel, WriterModel } from "../../example-models"
import { BaseModel } from "../base-model"
import { ModelRelationDefinition } from "../relations/relation-metadata"
import { ModelType } from "./extract-model-types"

type GetRelationProperties<TModel extends BaseModel> = ConditionalPick<
	TModel,
	ModelRelationDefinition<any>
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

if (import.meta.vitest) {
	//
	it("extract only relations", () => {
		const postType = {} as ExtractRelations<PostModel>
		assertType<{
			comments?: ModelType<CommentModel>[]
			tags?: ModelType<TagModel>[]
			info?: ModelType<PostInfoModel>[]
			writer?: ModelType<WriterModel>
		}>(postType)

		const typeComment = {} as ExtractRelations<CommentModel>
		assertType<{
			post?: ModelType<PostModel> | undefined
		}>(typeComment)
	})
}
