import { assertType, it } from "vitest"
import { CommentModel, PostModel } from "../example-models"
import { BaseModel } from "../model/base-model"
import { ModelType } from "../model/types/extract-model-types"
import { ModelVariant } from "./model-variant.type"

// It does not work without 2 NonNullable
export type SelectFields<T extends BaseModel> = {
	[key in keyof ModelType<T>]?: NonNullable<NonNullable<ModelType<T>>[key]> extends ModelVariant<
		infer TRelation extends BaseModel
	>
		? SelectFields<TRelation> | true
		: true
}

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
