/* eslint-disable @typescript-eslint/ban-types */
import { CommentModel, PostInfoModel, PostModel, TagModel } from "@orm/example-models"
import { BaseModel } from "@orm/model/base-model"
import { assertType, beforeEach, describe, it, vi } from "vitest"
import { OrmRepository } from "./OrmRepository"

// @ts-expect-error
class Repo<T extends BaseModel> extends OrmRepository<T> {}

describe("Fields", () => {
	const postRepo = new Repo<PostModel>({} as never)
	const commentsRepo = new Repo<CommentModel>({} as never)
	const postInfoRepo = new Repo<PostInfoModel>({} as never)
	const tagsRepo = new Repo<TagModel>({} as never)

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

			assertType<undefined>(result.comments)
			assertType<undefined>(result.tags)
			assertType<undefined>(result.info)
			assertType<undefined>(result.writer)

			// // @ts-expect-error
			// assertType<any[]>(result.comments)
			// // @ts-expect-error
			// assertType<any[]>(result.tags)
			// // @ts-expect-error
			// assertType<{}>(result.info)

			// assertType<any[] | undefined>(result.comments)
			// assertType<any[] | undefined>(result.tags)
			// assertType<{} | undefined>(result.info)
		})

		it("should return selected fields", () => {
			assertType<number>(result.likes)
			assertType<string>(result.title)
		})

		it("should not return non selected fields", () => {
			assertType<never>(result.body)
			assertType<never>(result.id)
			assertType<never>(result.createdAt)

			// // @ts-expect-error
			// assertType<string>(result.body)
			// // @ts-expect-error
			// assertType<string>(result.id)
			// // @ts-expect-error
			// assertType<Date>(result.createdAt)

			// assertType<string | undefined>(result.body)
			// assertType<string | undefined>(result.id)
			// assertType<Date | undefined>(result.createdAt)
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
			assertType<never>(result.post.id)
			assertType<never>(result.post.body)

			// // @ts-expect-error
			// assertType<string>(result.post.id)
			// // @ts-expect-error
			// assertType<string>(result.post.body)

			// assertType<string | undefined>(result.post.id)
			// assertType<string | undefined>(result.post.body)
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
			assertType<never>(result.post.id)
			assertType<never>(result.post.body)

			// // @ts-expect-error
			// assertType<string>(result.post.id)
			// // @ts-expect-error
			// assertType<string>(result.post.body)

			// assertType<string | undefined>(result.post.id)
			// assertType<string | undefined>(result.post.body)
		})
	})

	describe("one to many", async () => {
		const post = await postRepo.findOneOrThrow({
			fields: {
				comments: {
					id: true,
				},
			},
		})

		it("should return array if specified", () => {
			assertType<unknown[]>(post.comments)
		})

		it("should not return array if not specified", async () => {
			const result = await postRepo.findOneOrThrow({
				fields: {
					id: true,
				},
			})
			assertType<undefined>(result.comments)

			// // @ts-expect-error
			// assertType<unknown[]>(result.comments)

			// assertType<unknown[] | undefined>(result.comments)
		})

		it("should return selected fields", () => {
			const comment = post.comments[0]!

			assertType<string>(comment.id)
			// // @ts-expect-error
			// assertType<string>(comment.postId)
			assertType<never>(comment.postId)
		})

		it("should not return not specified fields", () => {
			const comment = post.comments[0]!

			assertType<string>(comment.id)
			// // @ts-expect-error
			// assertType<string>(comment.postId)
			assertType<never>(comment.postId)

			// // @ts-expect-error
			// assertType<string>(comment.body)
			assertType<never>(comment.body)
		})
	})

	it("should allow override with includeHidden", async () => {
		const res = await postInfoRepo.findOneOrThrow({
			fields: {
				id: true,
				hiddenField: true,
			},
		})
		assertType<{ id: string; hiddenField?: string }>(res)
		// @ts-expect-error
		assertType<string>(res.hiddenField)

		const res2 = await postInfoRepo.findOneOrThrow({
			includeHidden: true,
			fields: {
				id: true,
				hiddenField: true,
			},
		})

		assertType<string>(res2.hiddenField)
	})

	describe("create", () => {
		it("should require some fields", () => {
			postRepo.createOne({
				// @ts-expect-error
				data: {},
			})
		})

		it("should override can create", () => {
			postRepo.createOne({
				data: {
					// @ts-expect-error
					createdAt: new Date(),
					body: "hello",
					likes: 5,
					title: "",
					writerId: "uuid",
				},
			})

			postRepo.createOne({
				overrideCanCreate: true,
				data: {
					createdAt: new Date(),
					body: "hello",
					likes: 5,
					title: "",
					writerId: "uuid",
				},
			})
		})
	})
})
