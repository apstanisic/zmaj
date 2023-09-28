import { assertType, it } from "vitest"
import { CommentModel, PostModel } from "../../example-models"
import { SelectProperties } from "./select-properties.type"
//
it("should extract fields", () => {
	assertType<SelectProperties<PostModel>>({
		comments: true,
		body: true,
		tags: true,
		info: true,
		writer: true,
	})

	assertType<SelectProperties<PostModel>>({
		body: true,
		comments: { body: true },
		tags: { name: true },
		info: { postId: true },
		writer: { name: true },
	})

	assertType<SelectProperties<CommentModel>>({
		post: { id: true },
	})
})

it("should forbid non exiting", () => {
	assertType<SelectProperties<CommentModel>>({
		// @ts-expect-error
		hello: true,
		body: true,
	})
})

it("should require at least one field to be provided", () => {
	// @ts-expect-error
	assertType<SelectProperties<CommentModel>>({})
	//
	assertType<SelectProperties<CommentModel>>({ id: true })
})

it("should extract fields nested", () => {
	assertType<SelectProperties<PostModel>>({
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
