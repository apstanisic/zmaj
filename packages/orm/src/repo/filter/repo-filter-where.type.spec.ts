import { PostModel } from "@orm/example-models"
import { assertType, describe, it } from "vitest"
import { RepoFilterWhere } from "./repo-filter-where.type"

describe("CrudFilter", () => {
	it("should work only with BaseModel", () => {
		type A = RepoFilterWhere<PostModel>
		// @ts-expect-error
		type B = RepoFilterWhere<string>
		// @ts-expect-error
		type C = RepoFilterWhere<object>
	})

	it("should work with simple filter", () => {
		assertType<RepoFilterWhere<PostModel>>({
			body: "hello",
			createdAt: { $lt: new Date() },
			title: { $nin: ["Hello", "World"] },
		})
	})

	it("should allow nesting", () => {
		assertType<RepoFilterWhere<PostModel>>({
			comments: {
				body: "Hello World",
			},
			info: {
				post: {
					body: { $like: "World" }, //
				},
			},
		})
	})

	it("should allow $and and $or", () => {
		assertType<RepoFilterWhere<PostModel>>({
			comments: {
				$or: [{ body: "Hello" }, { id: { $ne: "test" } }],
			},
			info: {
				post: { $and: [{ likes: { $gte: 5 } }, {}] },
			},
		})
	})

	it("should require at least 2 items in $and/$or ", () => {
		// @ts-expect-error
		assertType<RepoFilterWhere<PostModel>>({ $and: [] })
		// @ts-expect-error
		assertType<RepoFilterWhere<PostModel>>({ $and: [{}] })
		assertType<RepoFilterWhere<PostModel>>({ $and: [{}, {}] })
	})

	it("should not allow both $and and $or", () => {
		assertType<RepoFilterWhere<PostModel>>({
			$and: [{}, {}],
			// @ts-expect-error
			$or: [{}, {}],
		})
	})

	it("should have filter for array relations as object", () => {
		assertType<RepoFilterWhere<PostModel>>({
			id: "Hello",
			comments: {
				body: "Body!",
			},
		})
	})
})
