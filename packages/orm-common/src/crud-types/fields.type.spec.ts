/* eslint-disable @typescript-eslint/ban-types */
import { EmptyObject } from "type-fest"
import { assertType, describe, it } from "vitest"
import { EntityRef } from "./entity-ref.type"
import { Fields } from "./fields.type"

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
	return <F extends Fields<T>>(f: F): F => f
}

describe("Fields", () => {
	it("should return nothing on empty object", () => {
		const type = getType<Post>()({})
		assertType<EmptyObject>(type)

		// @ts-expect-error
		assertType<{ id: true }>(type)
	})

	it("should return only specified fields", () => {
		const type = getType<Post>()({ id: true })
		assertType<{ id: true }>(type)

		// @ts-expect-error
		assertType<{ title: true }>(type)
		// @ts-expect-error
		assertType<{ title: true; id: true }>(type)
	})

	it("should set true to relation", () => {
		const type = getType<Post>()({ owner: true })
		assertType<{ owner: true }>(type)

		// @ts-expect-error
		assertType<{ owner: EmptyObject }>(type)
	})

	it("should allow getting partial relation", () => {
		const type = getType<Post>()({ owner: { id: true } })
		assertType<{ owner: { id: true } }>(type)

		// @ts-expect-error
		assertType<{ owner: { id: true; name: true } }>(type)
		// @ts-expect-error
		assertType<{ owner: { id: true; posts: true } }>(type)
	})

	it("should allow getting partial relation for array", () => {
		const type = getType<Post>()({ comments: { meta: true } })
		assertType<{ comments: { meta: true } }>(type)

		// @ts-expect-error
		assertType<{ comments: { id: true } }>(type)
		// @ts-expect-error
		assertType<{ comments: { id: true; meta: true } }>(type)
	})

	it("should allow getting partial relation for readonly array", () => {
		const type = getType<Post>()({ tags: { name: true } })
		assertType<{ tags: { name: true } }>(type)

		// @ts-expect-error
		assertType<{ tags: { id: true } }>(type)
		// @ts-expect-error
		assertType<{ tags: { id: true; name: true } }>(type)
	})

	// TODO FIX
	// it("should not care if value is object", () => {
	// 	// @ts-expect-error
	// 	const type = getType<Post>()({ comments: { meta: {} } })
	// })
})
