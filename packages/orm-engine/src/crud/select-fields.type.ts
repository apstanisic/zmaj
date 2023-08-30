import { assertType, it } from "vitest"
import { CommentModel, PostModel } from "../example-models"
import { BaseModel } from "../model/base-model"
import { ModelType } from "../model/types/extract-model-types"
import { ModelVariant } from "./model-variant.type"

type All = { $fields?: true }
// It does not work without 2 NonNullable
// TODO Disable passing fields that user cannot read (unless includeHidden is passed)
// $fields is special key that means get me all fields. It is useful if we need to get some relation
// we do not have to specify all fields
export type SelectFields<T extends BaseModel> = {
	[key in keyof ModelType<T>]?: NonNullable<NonNullable<ModelType<T>>[key]> extends ModelVariant<
		infer TRelation extends BaseModel
	>
		? SelectFields<TRelation> | true
		: true
} & All

if (import.meta.vitest) {
	//
	it("should extract fields", () => {
		assertType<SelectFields<PostModel>>({
			comments: true,
			body: true,
			tags: true,
			info: true,
			writer: true,
		})

		assertType<SelectFields<PostModel>>({
			body: true,
			comments: { body: true },
			tags: { name: true },
			info: { postId: true },
			writer: { name: true },
		})

		assertType<SelectFields<CommentModel>>({
			post: { id: true },
		})
	})
	it("should extract fields nested", () => {
		assertType<SelectFields<PostModel>>({
			comments: {
				body: true,
				post: {
					tags: {
						posts: {
							comments: {
								id: true,
							},
							info: {
								post: {
									createdAt: true, //
								},
							},
						},
					},
				},
			},
		})
	})
}
