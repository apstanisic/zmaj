/* eslint-disable @typescript-eslint/ban-types */
import { EmptyObject } from "type-fest"
import { assertType, describe, it } from "vitest"
import { EntityRef } from "./entity-ref.type"
import { Filter } from "./filter.type"

type Comment = {
	id: number
	meta: {
		device: string
	}
	post?: EntityRef<Post>
}

type Tag = {
	id: string
	name: string
}

type Owner = {
	id: string
	name: string
	posts?: EntityRef<Post>[]
}

type Post = {
	id: string
	title: string
	owner?: EntityRef<Owner>
	comments?: EntityRef<Comment>[]
	tags?: readonly EntityRef<Tag>[]
}

function getType<T>() {
	return <F extends Filter<T>>(f: F): F => f
}

describe("Fields", () => {
	it("should return nothing on empty object", () => {
		const type = getType<Post>()({})
		assertType<EmptyObject>(type)

		// @ts-expect-error
		assertType<{ id: any }>(type)
	})

	it("should require correct value for filtering ", () => {
		getType<Post>()({ id: "hello" })
		// @ts-expect-error
		getType<Post>()({ id: false })
	})

	it("should allow undefined everywhere", () => {
		getType<Post>()({ id: undefined })
		getType<Post>()({ tags: undefined })
	})

	it("should allow null for simple values", () => {
		getType<Post>()({ id: null })
		// @ts-expect-error
		getType<Post>()({ tags: null })
	})

	it("should allow nesting filter", () => {
		getType<Post>()({
			owner: {
				name: "Hello",
			},
		})
	})

	it("should allow nesting filter for array", () => {
		getType<Post>()({
			comments: {
				id: 5,
			},
		})
	})

	it("should allow $and & $or", () => {
		getType<Post>()({ $and: [{ id: "qwe" }, { title: "req" }] })
		getType<Post>()({ $or: [] })
	})

	it("should forbid both $or and $and", () => {
		// @ts-expect-error
		getType<Post>()({ $and: [{ id: "qwe" }], $or: [{ id: "qwe" }] })
	})

	// Explore `Exact`
	// it("should forbid unknown keys", () => {
	// 	// @ts-expect-error
	// 	getType<Post>()({ id: "hello", hello: "test" })
	// })

	// it("should forbid mixing normal & $and", () => {
	// 	// @ts-expect-error
	// 	getType<Post>()({ id: "hello", $and: [{ id: "qwe" }] })
	// })

	it("should allow deep nesting", () => {
		getType<Post>()({
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
		getType<Post>()({ title: {} })

		getType<Post>()({ title: { $gt: "Hello" } })
		// @ts-expect-error
		getType<Post>()({ title: { $gt: 5 } })
	})

	it("should require string for $like", () => {
		// @ts-expect-error
		getType<Comment>()({ id: { $like: 5 } })

		getType<Comment>()({ id: { $like: "Hello" } })
	})

	it("should require array for $in and $nin", () => {
		// @ts-expect-error
		getType<Comment>()({ id: { $in: 5 } })
		// @ts-expect-error
		getType<Comment>()({ id: { $nin: 5 } })

		// @ts-expect-error
		getType<Comment>()({ id: { $in: ["hello"] } })
		// @ts-expect-error
		getType<Comment>()({ id: { $nin: ["hello"] } })

		getType<Comment>()({ id: { $in: [5] } })
		getType<Comment>()({ id: { $nin: [5] } })
	})
})
