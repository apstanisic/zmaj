/* eslint-disable @typescript-eslint/ban-types */
import { EntityRef, Fields } from "@zmaj-js/common"
import { assertType, describe, it } from "vitest"
import { ReturnedFields } from "./returned-fields"

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
	return <F extends Fields<T> | undefined>(f: F | undefined): ReturnedFields<T, F> => ({}) as any
}

describe("Fields", () => {
	it("should return all fields and no relations if undefined", () => {
		const type = getType<Post>()(undefined)
		assertType<Post>(type)
		assertType<Owner | undefined>(type.owner)
		// @ts-expect-error
		assertType<Owner>(type.owner)
	})

	it("should return specified fields", () => {
		const type = getType<Post>()({ id: true })
		assertType<{ id: string }>(type)
		// @ts-expect-error
		assertType<{ id: string; title: string }>(type)
		// @ts-expect-error
		assertType<{ id: string; owner: Owner }>(type)
	})

	it("should return relation", () => {
		const type = getType<Post>()({ owner: true })
		assertType<{ owner: Owner }>(type)
		// @ts-expect-error
		assertType<{ id: string; title: string }>(type)
		// @ts-expect-error
		assertType<{ id: string; owner: any }>(type)
	})

	it("should allow deep nesting", () => {
		const type = getType<Post>()({
			title: true,
			owner: {
				name: true,
				posts: {
					id: true,
					comments: {
						id: true,
					},
				},
			},
			comments: { meta: true },
			tags: { name: true },
		})

		type.owner
		type.comments
		assertType<{
			title: string
			id?: string
			comments: {
				meta: { device: string }
				id?: number
				post?: Post
			}[]
			owner: {
				id?: string
				name: string
				posts: {
					id: string
					comments: {
						id: number
					}[]
				}[]
			}
		}>(type)
	})
})
