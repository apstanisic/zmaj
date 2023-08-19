/* eslint-disable @typescript-eslint/ban-types */
import { PostModel } from "@orm-common/example-models"
import { EmptyObject } from "type-fest"
import { assertType, describe, it } from "vitest"
import { BaseModel, ModelType } from ".."
import { Fields } from "./fields.type"

function getType<T extends BaseModel>() {
	return <F extends Fields<ModelType<T>>>(f: F): F => f
}

describe("Fields", () => {
	it("should return nothing on empty object", () => {
		const type = getType<PostModel>()({})
		assertType<EmptyObject>(type)

		// @ts-expect-error
		assertType<{ id: true }>(type)
	})

	it("should return only specified fields", () => {
		const type = getType<PostModel>()({ id: true })
		assertType<{ id: true }>(type)

		// @ts-expect-error
		assertType<{ title: true }>(type)
		// @ts-expect-error
		assertType<{ title: true; id: true }>(type)
	})

	it("should set true to relation", () => {
		const type = getType<PostModel>()({ writer: true })
		assertType<{ writer: true }>(type)

		// @ts-expect-error
		assertType<{ writer: EmptyObject }>(type)
	})

	it("should allow getting partial relation", () => {
		const type = getType<PostModel>()({ writer: { id: true } })
		assertType<{ writer: { id: true } }>(type)

		// @ts-expect-error
		assertType<{ writer: { id: true; name: true } }>(type)
		// @ts-expect-error
		assertType<{ writer: { id: true; posts: true } }>(type)
	})

	it("should allow getting partial relation for array", () => {
		const type = getType<PostModel>()({ comments: { body: true } })
		assertType<{ comments: { body: true } }>(type)

		// @ts-expect-error
		assertType<{ comments: { id: true } }>(type)
		// @ts-expect-error
		assertType<{ comments: { id: true; meta: true } }>(type)
	})

	it("should allow getting partial relation for readonly array", () => {
		const type = getType<PostModel>()({ tags: { name: true } })
		assertType<{ tags: { name: true } }>(type)

		// @ts-expect-error
		assertType<{ tags: { id: true } }>(type)
		// @ts-expect-error
		assertType<{ tags: { id: true; name: true } }>(type)
	})

	// TODO FIX
	// it("should not care if value is object", () => {
	// 	// @ts-expect-error
	// 	const type = getType<PostModel>()({ comments: { meta: {} } })
	// })
})
