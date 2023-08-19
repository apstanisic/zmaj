/* eslint-disable @typescript-eslint/ban-types */
import { BaseModel } from "@zmaj-js/orm-common"
import { assertType, beforeEach, describe, it, vi } from "vitest"
import { OrmRepository } from "./OrmRepository"
import { CommentModel, PostInfoModel, PostModel, TagModel } from "./models.stub"

// @ts-expect-error
class Repo<T extends BaseModel> extends OrmRepository<T> {}

describe("Fields", () => {
	const postRepo = new Repo<PostModel>()
	const commentsRepo = new Repo<CommentModel>()
	const postInfoRepo = new Repo<PostInfoModel>()
	const tagsRepo = new Repo<TagModel>()

	beforeEach(() => {
		postRepo.findOneOrThrow = vi.fn().mockResolvedValue({})
		commentsRepo.findOneOrThrow = vi.fn().mockResolvedValue({})
	})

	describe("direct fields", async () => {
		const result = await postRepo.findOneOrThrow({
			fields: {
				likes: true,
				title: true,
			},
		})

		it("should return all when no fields specified", async () => {
			const result = await postRepo.findOneOrThrow({})
			assertType<string>(result.body)
			assertType<string>(result.title)
			assertType<string>(result.id)
			assertType<number>(result.likes)
			assertType<Date>(result.createdAt)
		})
		it("should not return relations by default", async () => {
			const result = await postRepo.findOneOrThrow({})
			// @ts-expect-error
			assertType<any[]>(result.comments)
			// @ts-expect-error
			assertType<any[]>(result.tags)
			// @ts-expect-error
			assertType<{}>(result.info)

			assertType<any[] | undefined>(result.comments)
			assertType<any[] | undefined>(result.tags)
			assertType<{} | undefined>(result.info)
		})

		it("should return selected fields", () => {
			assertType<number>(result.likes)
			assertType<string>(result.title)
		})

		it("should not return non selected fields", () => {
			// @ts-expect-error
			assertType<string>(result.body)
			// @ts-expect-error
			assertType<string>(result.id)
			// @ts-expect-error
			assertType<Date>(result.createdAt)

			assertType<string | undefined>(result.body)
			assertType<string | undefined>(result.id)
			assertType<Date | undefined>(result.createdAt)
		})
	})

	// TODO Check if value is nullable!
	describe("many to one", async () => {
		const result = await commentsRepo.findOneOrThrow({
			fields: {
				post: {
					title: true,
					createdAt: true,
				},
			},
		})

		it("should return specified", () => {
			assertType<string>(result.post.title)
			assertType<Date>(result.post.createdAt)
		})

		it("should not return not specified fields", () => {
			// @ts-expect-error
			assertType<string>(result.post.id)
			// @ts-expect-error
			assertType<string>(result.post.body)

			assertType<string | undefined>(result.post.id)
			assertType<string | undefined>(result.post.body)
		})
	})

	// TODO Check if value is nullable!
	describe("owner one to one", async () => {
		const result = await postInfoRepo.findOneOrThrow({
			fields: {
				post: {
					title: true,
					createdAt: true,
				},
			},
		})

		it("should return specified", () => {
			assertType<string>(result.post.title)
			assertType<Date>(result.post.createdAt)
		})

		it("should not return not specified fields", () => {
			// @ts-expect-error
			assertType<string>(result.post.id)
			// @ts-expect-error
			assertType<string>(result.post.body)

			assertType<string | undefined>(result.post.id)
			assertType<string | undefined>(result.post.body)
		})
	})

	describe("one to many", async () => {
		const result = await postRepo.findOneOrThrow({
			fields: {
				comments: {
					id: true,
				},
			},
		})
		it("should return array if specified", () => {
			assertType<unknown[]>(result.comments)
		})
		it("should not return array if not specified", async () => {
			const result = await postRepo.findOneOrThrow({
				fields: {
					id: true,
				},
			})

			// @ts-expect-error
			assertType<unknown[]>(result.comments)

			assertType<unknown[] | undefined>(result.comments)
		})

		it("should return selected fields", () => {
			const comment = result.comments[0]!

			assertType<string>(comment.id)
			assertType<Date>(comment.title)
		})

		it("should not return not specified fields", () => {
			// @ts-expect-error
			assertType<string>(result.post.id)
			// @ts-expect-error
			assertType<string>(result.post.body)

			assertType<string | undefined>(result.post.id)
			assertType<string | undefined>(result.post.body)
		})
	})
})
