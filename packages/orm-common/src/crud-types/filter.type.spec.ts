/* eslint-disable @typescript-eslint/ban-types */
import { CommentModel, PostModel } from "@orm-common/example-models"
import { EmptyObject } from "type-fest"
import { assertType, describe, it } from "vitest"
import { BaseModel, ModelType } from ".."
import { Filter } from "./filter.type"

function getType<T extends BaseModel>() {
	return <F extends Filter<ModelType<T>>>(f: F): F => f
}

describe("Fields", () => {
	it("should return nothing on empty object", () => {
		const type = getType<PostModel>()({})
		assertType<EmptyObject>(type)

		// @ts-expect-error
		assertType<{ id: any }>(type)
	})

	it("should require correct value for filtering ", () => {
		getType<PostModel>()({ id: "hello" })
		// @ts-expect-error
		getType<PostModel>()({ id: false })
	})

	it("should allow undefined everywhere", () => {
		getType<PostModel>()({ id: undefined })
		getType<PostModel>()({ tags: undefined })
	})

	it("should allow null for simple values", () => {
		getType<PostModel>()({ id: null })
		// @ts-expect-error
		getType<PostModel>()({ tags: null })
	})

	it("should allow nesting filter", () => {
		getType<PostModel>()({
			writer: {
				name: "Hello",
			},
		})
	})

	it("should allow nesting filter for array", () => {
		getType<PostModel>()({
			comments: {
				id: "5",
			},
		})
	})

	it("should allow $and & $or", () => {
		getType<PostModel>()({ $and: [{ id: "qwe" }, { title: "req" }] })
		getType<PostModel>()({ $or: [] })
	})

	it("should forbid both $or and $and", () => {
		// @ts-expect-error
		getType<PostModel>()({ $and: [{ id: "qwe" }], $or: [{ id: "qwe" }] })
	})

	// Explore `Exact`
	// it("should forbid unknown keys", () => {
	// 	// @ts-expect-error
	// 	getType<PostModel>()({ id: "hello", hello: "test" })
	// })

	// it("should forbid mixing normal & $and", () => {
	// 	// @ts-expect-error
	// 	getType<PostModel>()({ id: "hello", $and: [{ id: "qwe" }] })
	// })

	it("should allow deep nesting", () => {
		getType<PostModel>()({
			$and: [
				{ id: "qwe" },
				{ $or: [{ title: "My" }] },
				{
					owner: {
						name: "hello",
					},
				},
			],
		})
	})

	it("should require comparison if object", () => {
		// @ts-expect-error
		getType<PostModel>()({ title: {} })

		getType<PostModel>()({ title: { $gt: "Hello" } })
		// @ts-expect-error
		getType<PostModel>()({ title: { $gt: 5 } })
	})

	it("should require string for $like", () => {
		// @ts-expect-error
		getType<CommentModel>()({ id: { $like: 5 } })

		getType<CommentModel>()({ id: { $like: "Hello" } })
	})

	it("should require array for $in and $nin", () => {
		// @ts-expect-error
		getType<CommentModel>()({ id: { $in: "5" } })
		// @ts-expect-error
		getType<CommentModel>()({ id: { $nin: "5" } })

		// @ts-expect-error
		getType<CommentModel>()({ id: { $in: [5] } })
		// @ts-expect-error
		getType<CommentModel>()({ id: { $nin: [5] } })

		getType<CommentModel>()({ id: { $in: ["5"] } })
		getType<CommentModel>()({ id: { $nin: ["5"] } })
	})
})
