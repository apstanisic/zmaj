import { throw500 } from "@api/common/throw-http"
import { DatabaseConfig } from "@api/database/database.config"
import { ConfigService } from "@api/index"
import { fixTestDate } from "@api/testing/stringify-date"
import { InternalServerErrorException, NotFoundException } from "@nestjs/common"
import { throwErr, uuidRegex } from "@zmaj-js/common"
import {
	allMockCollectionDefs,
	modifyTestInfra,
	TComment,
	TPost,
	TPostInfo,
	TPostStub,
	TPostTag,
	TTag,
} from "@zmaj-js/test-utils"
import { alphabetical, isObject, sort } from "radash"
import { v4 } from "uuid"
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import mockData from "../testing/const-mocks.json"
import { SequelizeRepository } from "./sequelize.repository"
import { SequelizeService } from "./sequelize.service"

describe("SequelizeRepository", () => {
	let stub: {
		post: TPost
		comments: TComment[]
		tags: TTag[]
		postsTags: TPostTag[]
		postInfo: TPostInfo
	}
	let ormS: SequelizeService
	let repo: SequelizeRepository<TPost>
	let tagRepo: SequelizeRepository<TTag>

	beforeAll(() => {
		const post = mockData.posts.find((p) => p.id === "403c27ac-6601-4425-ac01-ba7fcc489d61")!
		const postInfo = mockData.postInfo.find((pi) => pi.postId === post.id)
		const comments = mockData.comments.filter((c) => c.postId === post.id)
		const postsTags = mockData.postsTags.filter((pt) => pt.postId === post.id)
		const tags = alphabetical(
			mockData.tags.filter((t) => postsTags.some((pt) => pt.tagId === t.id)),
			(t) => t.id,
		)

		if (!post) throwErr("938712")
		if (!postInfo) throwErr("96922")
		if (postsTags.length === 0) throwErr("128974")
		if (tags.length === 0) throwErr("1263912")
		if (comments.length === 0) throwErr("3876921")

		stub = {
			post: { ...post, createdAt: new Date(post.createdAt) },
			tags,
			comments,
			postInfo,
			postsTags,
		}
	})
	//
	beforeAll(async () => {
		const configService = new ConfigService({
			envPath: ".env.test",
			throwOnNoEnvFile: true,
			useEnvFile: true,
			useProcessEnv: false,
			assignToProcessEnv: false,
		})
		const config = new DatabaseConfig({}, configService)

		ormS = new SequelizeService(config)

		await ormS.init(allMockCollectionDefs)
	})

	afterAll(async () => {
		await ormS.onModuleDestroy()
	})

	beforeEach(() => {
		// reset models before every test
		ormS.generateModels(allMockCollectionDefs)
		repo = new SequelizeRepository<TPost>(ormS, "posts")
		tagRepo = new SequelizeRepository<TTag>(ormS, "tags")
	})

	it("should compile", () => {
		const repo = new SequelizeRepository(ormS, "posts")
		expect(repo).toBeDefined()
	})

	describe("findWhere", () => {
		it("should find by id", async () => {
			const res = await repo.findWhere({ where: mockData.posts[0]!.id })
			expect(res.map((r) => fixTestDate(r))).toEqual([mockData.posts[0]])
		})

		it("should find by ids", async () => {
			const res = await repo.findWhere({ where: [mockData.posts[0]!.id, mockData.posts[1]!.id] })
			expect(res.map((r) => fixTestDate(r))).toEqual(mockData.posts.slice(0, 2))
		})

		it("should find by filter", async () => {
			const all = await repo.findWhere({})
			const middle = Math.floor(all.length / 2)
			const medianLikes = sort(all, (p) => p.likes)[middle]!
			const res = await repo.findWhere({ where: { likes: { $gte: medianLikes.likes } } })
			expect(res.length).toEqual(middle)
		})

		it("should find by filter with like", async () => {
			const onlyFirst = await repo.findWhere({ limit: 1 })
			const titleWithoutStart = onlyFirst[0]!.title.substring(2)
			const res = await repo.findWhere({
				where: { title: { $like: `%${titleWithoutStart}` }, id: onlyFirst[0]!.id },
			})
			expect(res).toEqual(onlyFirst)
		})

		it("should find by filter with $and single comparison", async () => {
			const onlyFirst = await repo.findWhere({ limit: 1 })
			const titleWithoutStart = onlyFirst[0]!.title.substring(2)
			const res = await repo.findWhere({
				where: { $and: [{ title: { $like: `%${titleWithoutStart}` } }] },
			})
			expect(res).toEqual(onlyFirst)
		})

		it("should sort", async () => {
			const sorted = sort(mockData.posts, (p) => p.likes)
			const res = await repo.findWhere({ orderBy: { likes: "ASC" } })
			res.reduce((v1, v2) => {
				expect(v2.likes).toBeGreaterThanOrEqual(v1.likes)
				// if (v1 > v2) throw new Error()
				return v2
			})

			// expect(res.map((row) => row.id)).toEqual(sorted.map((r) => r.id))
		})

		it("should limit", async () => {
			const res = await repo.findWhere({ limit: 5 })
			expect(res.length).toEqual(5)
		})

		it("should offset", async () => {
			// const sorted = drop(
			// 	sortBy(mockData.posts, (p) => p.likes),
			// 	20,
			// )
			const withoutOffset = await repo.findWhere({
				offset: 0,
				limit: 1020,
				orderBy: { likes: "ASC" },
			})
			const withOffset = await repo.findWhere({
				offset: 20,
				limit: 1000,
				orderBy: { likes: "ASC" },
			})
			expect(withOffset.map((r) => r.id)).toEqual(withoutOffset.slice(20).map((r) => r.id))
		})

		// it("should offset only if limit is provided", async () => {
		//   // this is a bug in mikro-orm, not in our code, but we have to have test case to ensure
		//   // this behavior
		//   const sorted = drop(
		//     sortBy(mockData.posts, (p) => p.likes),
		//     20,
		//   )
		//   // const res = await repo.findWhere({ offset: 20, limit: Number.MAX_SAFE_INTEGER })
		//   const res = await repo.findWhere({ offset: 20 })
		//   expect(res.length).toEqual(sorted.length + 20)
		// })

		it("should return whole object if fields is an empty object", async () => {
			const res = await repo.findWhere({ fields: {}, where: mockData.posts[0]!.id })
			expect(fixTestDate(res[0]!)).toEqual(mockData.posts[0])
		})

		it("should return whole object if fields is undefined", async () => {
			const res = await repo.findWhere({ where: mockData.posts[0]!.id })
			expect(fixTestDate(res[0]!)).toEqual(mockData.posts[0])
		})

		// it("should always return id", async () => {
		//   const post = mockData.posts[0]!
		//   const res = await repo.findWhere({ fields: { body: true }, where: post.id })
		//   expect(fixTestDate(res[0]!)).toEqual({ id: post.id, body: post.body })
		// })

		it("should return specified fields", async () => {
			const post = mockData.posts[0]!
			const res = await repo.findWhere({ fields: { body: true, likes: true }, where: post.id })
			//   expect(fixTestDate(res[0]!)).toEqual({ id: post.id, body: post.body, likes: post.likes })
			expect(fixTestDate(res[0]!)).toEqual({ body: post.body, likes: post.likes })
		})

		it("should allow returning hidden fields", async () => {
			const changedInfra = modifyTestInfra((draft) => {
				draft.find((c) => c.tableName === "posts")!.fields["body"]!.canRead = false
				// .fullFields.find((f) => f.columnName === "body")!.canRead = false
			})

			ormS.generateModels(changedInfra)

			const post = mockData.posts[0]!
			const res1 = await repo.findWhere({
				fields: { body: true, id: true, title: true },
				where: post.id,
			})
			const withoutHidden = res1[0]!
			expect(withoutHidden.id).toBeDefined()
			expect(withoutHidden.title).toBeDefined()
			expect(withoutHidden.body).toBeUndefined()

			const res2 = await repo.findWhere({
				fields: { body: true, id: true, title: true },
				where: post.id,
				includeHidden: true,
			})
			const withHidden = res2[0]!
			expect(withHidden.id).toBeDefined()
			expect(withHidden.title).toBeDefined()
			expect(withHidden.body).toBeDefined()
		})

		describe("many-to-one", () => {
			const comment = mockData.comments[0]!
			const post = mockData.posts.find((p) => p.id === comment.postId) ?? throwErr("39712")
			let cRepo: SequelizeRepository<TComment>

			beforeEach(() => {
				cRepo = new SequelizeRepository<TComment>(ormS, "comments")
			})

			it("get fk property without getting relation", async () => {
				const res = await cRepo.findWhere({ fields: { postId: true }, where: comment.id })
				expect(fixTestDate(res[0]!)).toEqual({ postId: comment.postId })
			})

			it("get should not set relation property to it's FK", async () => {
				const res = await cRepo.findWhere({ where: comment.id })
				expect(fixTestDate(res[0]!).post).toBeUndefined()
			})

			it("get relation without getting fk working", async () => {
				// this is a problem with mikro-orm
				// but we are recursively fixing it
				const res = await cRepo.findWhere({ fields: { post: true }, where: comment.id })
				expect(fixTestDate(res[0]!)).toEqual({ post })
			})
		})

		describe("one-to-one", () => {
			const postInfo = mockData.postInfo[0]!
			const post = mockData.posts.find((p) => p.id === postInfo.postId) ?? throw500(13212223)

			let piRepo: SequelizeRepository<TPostInfo>

			beforeEach(() => {
				piRepo = new SequelizeRepository<TPostInfo>(ormS, "posts_info")
			})

			describe("owner", () => {
				it("get o2o relation", async () => {
					const res = await repo.findWhere({ fields: { postInfo: true }, where: post.id })
					expect(fixTestDate(res[0]!)).toEqual({ postInfo })
				})
			})

			describe("ref-one-to-one", () => {
				it("get fk property without getting relation", async () => {
					const res = await piRepo.findWhere({ fields: { postId: true }, where: postInfo.id })
					expect(fixTestDate(res[0]!)).toEqual({ postId: postInfo.postId })
				})

				it("get should not set relation property to it's FK", async () => {
					const res = await piRepo.findWhere({ where: postInfo.id })
					expect(fixTestDate(res[0]!).post).toBeUndefined()
				})

				it("get relation without getting fk working", async () => {
					// this is a problem with mikro-orm
					// but we are fixing result
					const res = await piRepo.findWhere({ fields: { post: true }, where: postInfo.id })
					expect(fixTestDate(res[0]!)).toEqual({ post })
				})
			})
		})

		describe("one-to-many", () => {
			const post = mockData.posts[0]!
			const comments = alphabetical(
				mockData.comments.filter((c) => c.postId === post.id),
				(c) => c.body,
			)
			//
			it("should join properly", async () => {
				const res = await repo.findWhere({
					fields: { comments: true },
					where: post.id,
				})
				const dbPost = res[0]!
				const dbComments = alphabetical(dbPost.comments, (c) => c.body)
				expect(dbComments.map((c) => fixTestDate(c))).toEqual(comments)
			})

			it("join get only specified fields", async () => {
				const res = await repo.findWhere({
					fields: { comments: { body: true, postId: true, id: true } },
					where: post.id,
				})
				const dbPost = res[0]!
				const dbComments = alphabetical(dbPost.comments, (c) => c.body)
				expect(dbComments).toEqual(
					comments.map((c) => ({ body: c.body, postId: c.postId, id: c.id })),
				)
			})

			// it("join get always get id", async () => {
			//   const res = await repo.findWhere({
			//     fields: { comments: { postId: true } },
			//     where: post.id,
			//   })
			//   const dbPost = res[0]!
			//   const dbComments = sortBy(dbPost.comments, (c) => c.id)
			//   expect(dbComments).toEqual(comments.map((c) => ({ postId: c.postId, id: c.id })))
			// })

			it("should not get FK from child as it's needed to join", async () => {
				// fixed with postprocessing. By default it does provide
				const res = await repo.findWhere({
					fields: { comments: { body: true } },
					where: post.id,
				})
				const dbPost = res[0]!
				const dbComments = alphabetical(dbPost.comments, (c) => c.body)
				expect(dbComments).toEqual(comments.map((c) => ({ body: c.body })))
			})
		})

		describe("many-to-many", () => {
			const post = mockData.posts[0]!
			const postTags = mockData.postsTags.filter((c) => c.postId === post.id)
			const tags = alphabetical(
				mockData.tags.filter((t) => postTags.some((pt) => pt.tagId === t.id)),
				(t) => t.id,
			)

			it("should join m2m properly", async () => {
				const res = await repo.findWhere({ fields: { tags: true }, where: post.id })
				const dbPost = res[0]!
				const dbTags = alphabetical(dbPost.tags, (t) => t.id)
				expect(dbTags).toEqual(tags)
			})

			it("should always get pk", async () => {
				const res = await repo.findWhere({ fields: { tags: { name: true } }, where: post.id })
				const dbPost = res[0]!
				// FIXME???
				const dbTags = alphabetical(dbPost.tags, (t) => t.id ?? "----")
				expect(dbTags).toEqual(tags.map((t) => ({ id: t.id, name: t.name })))
			})

			it("should get specified fields", async () => {
				const res = await repo.findWhere({ fields: { tags: { id: true } }, where: post.id })
				const dbPost = res[0]!
				const dbTags = alphabetical(dbPost.tags, (t) => t.id)
				expect(dbTags).toEqual(tags.map((t) => ({ id: t.id })))
			})
		})

		describe("recursively", () => {
			// it didn't work in mikro orm but should work in sq
			it.skip("should work recursively", async () => {
				// it's not working properly
				// it's reusing records from relations, so it's always selecting rows first selected field.
				// that's not good for type safety
				// and only way is to generate ast of relations, take all fields that are requested.
				// then pass to mikro orm, and in the end handle redundant fields
				// it only is invalid when same entity is referenced multiple times
				const res = await repo.findWhere({
					where: stub.post.id,
					fields: {
						body: true,
						tags: { posts: { id: true, body: true, postInfo: true } },
						comments: { post: true },
						postInfo: { id: true, post: true },
						// postInfo: true,
					},
				})
				const dbPost = res[0]!

				expect(dbPost.postInfo).toEqual({
					id: stub.postInfo.id,
					post: stub.post,
					// postId: stub.post.id,
				})
				// expect(dbPost.postInfo.post).toEqual(dbPost)
			})

			it("should filter", async () => {
				const res = await repo.findWhere({
					fields: { body: true, postInfo: true },
					// where: { comments: { body: "HELLO WORLD" } },
					where: { comments: { id: v4() } },
				})
				expect(res).toBeDefined()
			})
		})
	})

	describe("rawQuery", () => {
		it("should execute raw query", async () => {
			const res: any = await repo.rawQuery("select * from posts limit 1")
			// specific for db type
			expect(res).toHaveLength(1)
		})
	})

	describe("findOne", () => {
		it("should findOne", async () => {
			const mockPost = TPostStub()
			repo.findWhere = vi.fn(async () => [mockPost as any])

			// tag
			const res = await repo.findOne({
				fields: { body: true, tags: { id: true } },
				orderBy: { likes: "ASC" },
				where: { body: { $ne: "Hello" } },
				trx: "TRX" as any,
			})
			expect(res).toEqual(mockPost)
			expect(repo.findWhere).toBeCalledWith({
				fields: { body: true, tags: { id: true } },
				orderBy: { likes: "ASC" },
				where: { body: { $ne: "Hello" } },
				trx: "TRX" as any,
				limit: 1,
			})
		})
		it("should return undefined if there is no record", async () => {
			//
			repo.findWhere = vi.fn(async () => [])
			const res = await repo.findOne({})
			expect(res).toBeUndefined()
		})
	})

	describe("findOneOrThrow", () => {
		it("should findOne", async () => {
			const mockPost = TPostStub()
			repo.findOne = vi.fn(async () => mockPost as any)

			const res = await repo.findOneOrThrow("test_me" as any)
			expect(res).toEqual(mockPost)
			expect(repo.findOne).toBeCalledWith("test_me")
		})
		it("should throw if there is no record", async () => {
			//
			repo.findOne = vi.fn(async () => undefined)
			await expect(repo.findOneOrThrow({})).rejects.toThrow()
		})
	})

	// describe.skip("createOne - direct implementation", () => {
	// 	let post: TPost
	// 	beforeEach(() => {
	// 		post = TPostStub()
	// 	})

	// 	it("should create one record", async () => {
	// 		await repo.createOne({
	// 			data: post,
	// 		})
	// 		const res = await repo.findById({ id: post.id })
	// 		expect(res).toEqual(post)
	// 	})

	// 	it("should return created record", async () => {
	// 		const result = await repo.createOne({
	// 			data: { ...post, createdAt: undefined },
	// 		})
	// 		expect(result).toEqual({
	// 			...post,
	// 			createdAt: expect.any(Date),
	// 		})
	// 	})

	// 	// we need to have nullable field to test this
	// 	it("should pass to create only allowed fields", async () => {
	// 		repo["getNonReadonlyFields"] = vi.fn(() => ["title", "body"])
	// 		const create = vi.fn(async () => ({ get: vi.fn() }) as any)
	// 		repo["model"].create = create
	// 		await repo.createOne({ data: post })
	// 		expect(create).toBeCalledWith(post, {
	// 			fields: ["title", "body"],
	// 			transaction: undefined,
	// 		})
	// 	})

	// 	it("should return plain object", async () => {
	// 		const res = await repo.createOne({ data: post })
	// 		expect(isPlainObject(res)).toEqual(true)
	// 		//
	// 	})

	// 	it("should use provided trx", async () => {
	// 		const create = vi.fn(async () => ({ get: vi.fn() }) as any)
	// 		repo["model"].create = create
	// 		await repo.createOne({ data: post, trx: "hello" as any })
	// 		expect(create).toBeCalledWith(post, {
	// 			fields: expect.anything(),
	// 			transaction: "hello",
	// 		})
	// 	})
	// })

	// I'm going to use createOne as a wrapper around createMany
	// describe.skip("createOne - direct implementation", () => {
	// 	let post: TPost
	// 	beforeEach(() => {
	// 		post = TPostStub()
	// 	})

	// 	it("should create one record", async () => {
	// 		await repo.createOne({
	// 			data: post,
	// 		})
	// 		const res = await repo.findById({ id: post.id })
	// 		expect(res).toEqual(post)
	// 	})

	// 	it("should return created record", async () => {
	// 		const result = await repo.createOne({
	// 			data: { ...post, createdAt: undefined },
	// 		})
	// 		expect(result).toEqual({
	// 			...post,
	// 			createdAt: expect.any(Date),
	// 		})
	// 	})

	// 	// we need to have nullable field to test this
	// 	it("should pass to create only allowed fields", async () => {
	// 		repo["getNonReadonlyFields"] = vi.fn(() => ["title", "body"])
	// 		const create = vi.fn(async () => ({ get: vi.fn() }) as any)
	// 		repo["model"].create = create
	// 		await repo.createOne({ data: post })
	// 		expect(create).toBeCalledWith(post, {
	// 			fields: ["title", "body"],
	// 			transaction: undefined,
	// 		})
	// 	})

	// 	it("should return plain object", async () => {
	// 		const res = await repo.createOne({ data: post })
	// 		expect(isPlainObject(res)).toEqual(true)
	// 		//
	// 	})

	// 	it("should use provided trx", async () => {
	// 		const create = vi.fn(async () => ({ get: vi.fn() }) as any)
	// 		repo["model"].create = create
	// 		await repo.createOne({ data: post, trx: "hello" as any })
	// 		expect(create).toBeCalledWith(post, {
	// 			fields: expect.anything(),
	// 			transaction: "hello",
	// 		})
	// 	})
	// })

	describe("createOne", () => {
		let post: TPost
		beforeEach(() => {
			post = TPostStub()
			repo.createMany = vi.fn(async () => [post])
		})

		it("should call createMany", async () => {
			const res = await repo.createOne({ data: post, trx: "hello" as any })
			expect(res).toEqual(post)
			expect(repo.createMany).toBeCalledWith({ data: [post], trx: "hello" })
		})

		it("should throw if return is not single record", async () => {
			vi.mocked(repo.createMany).mockResolvedValue([])
			await expect(repo.createOne({ data: post, trx: "hello" as any })).rejects.toThrow(
				InternalServerErrorException,
			)

			vi.mocked(repo.createMany).mockResolvedValue([post, post])
			await expect(repo.createOne({ data: post, trx: "hello" as any })).rejects.toThrow(
				InternalServerErrorException,
			)
		})
	})

	describe("createMany", () => {
		let post1: TPost
		let post2: TPost
		let posts: [TPost, TPost]
		beforeEach(() => {
			post1 = TPostStub()
			post2 = TPostStub()
			posts = [post1, post2]
		})

		it("should create many records", async () => {
			await repo.createMany({
				data: posts,
			})
			const res1 = await repo.findById({ id: post1.id })
			expect(res1).toEqual(post1)
			const res2 = await repo.findById({ id: post2.id })
			expect(res2).toEqual(post2)
		})

		it("should handle creating uuid", async () => {
			const result = await repo.createMany({
				data: [{ body: "Hello", likes: 55, title: "Title" }],
			})
			expect(result[0]?.id).toMatch(uuidRegex)
		})

		it("should create uuid even when user can't set that value", async () => {
			repo["getNonReadonlyFields"] = vi.fn(() => ["body", "likes", "title"])
			const result = await repo.createMany({
				data: [{ body: "Hello", likes: 55, title: "Title" }],
			})
			expect(result[0]?.id).toMatch(uuidRegex)
			expect(result[0]?.createdAt).toBeInstanceOf(Date)
		})

		it("should return created records", async () => {
			const result = await repo.createMany({
				data: posts.map((p) => ({ ...p, createdAt: undefined })),
			})
			expect(result).toEqual([
				{
					...post1,
					createdAt: expect.any(Date),
				},
				{
					...post2,
					createdAt: expect.any(Date),
				},
			])
		})

		it("should pass to create only allowed fields", async () => {
			repo["getNonReadonlyFields"] = vi.fn(() => ["title", "body"])
			const create = vi.fn(async () => [{ get: vi.fn() } as any])
			repo["model"].bulkCreate = create
			await repo.createMany({ data: [post1] })
			expect(create).toBeCalledWith([{ title: post1.title, body: post1.body }], {
				// fields: ["title", "body"],
				transaction: undefined,
			})
		})

		it("should return plain object", async () => {
			const res = await repo.createMany({ data: [post1] })
			expect(isObject(res.at(0))).toEqual(true)
			//
		})

		it("should use provided trx", async () => {
			const create = vi.fn(async () => [{ get: vi.fn() } as any])
			repo["model"].bulkCreate = create
			await repo.createMany({ data: [post1], trx: "hello" as any })
			expect(create).toBeCalledWith([post1], {
				// fields: expect.anything(),
				transaction: "hello",
			})
		})
	})

	describe("updateById", () => {
		let post: TPost
		beforeEach(async () => {
			post = TPostStub()
		})

		it("should pass data to update many with proper id", async () => {
			repo.updateWhere = vi.fn(async () => [{ ...post, title: "updated" }])
			await repo.updateById({
				id: post.id,
				changes: { body: "hello" },
				trx: "hello_trx" as any,
			})
			expect(repo.updateWhere).toBeCalledWith({
				where: post.id,
				changes: { body: "hello" },
				trx: "hello_trx" as any,
			})
		})

		it("should throw if no record is updated", async () => {
			repo.updateWhere = vi.fn(async () => [])
			const res = repo.updateById({
				id: post.id,
				changes: { body: "hello" },
			})
			await expect(res).rejects.toThrow(NotFoundException)
		})

		it("should return updated record", async () => {
			repo.updateWhere = vi.fn(async () => [{ ...post, title: "updated" }])
			const res = await repo.updateById({
				id: post.id,
				changes: { body: "hello" },
			})
			expect(res).toEqual({ ...post, title: "updated" })
		})
	})

	describe("updateWhere", () => {
		let post1: TPost

		beforeEach(async () => {
			post1 = await repo.createOne({ data: TPostStub() })
		})

		it("should update record", async () => {
			await repo.updateWhere({
				where: post1.id,
				changes: { body: "new_body" },
			})
			const updated = await repo.findById({ id: post1.id })
			expect(updated.body).toEqual("new_body")
		})
		//
		it("should return updated records", async () => {
			const res = await repo.updateWhere({
				where: post1.id,
				changes: { body: "new_body" },
			})
			expect(res).toEqual<TPost[]>([{ ...post1, body: "new_body" }])
		})

		it("should pass only allowed fields", async () => {
			repo["getNonReadonlyFields"] = () => ["title"]
			const res = await repo.updateWhere({
				where: post1.id,
				changes: { body: "new_body", title: "new_title" },
			})
			expect(res[0]?.title).toEqual("new_title")
			expect(res[0]?.body).not.toEqual("new_body")
		})

		it("should return plain object", async () => {
			const res = await repo.updateWhere({
				where: post1.id,
				changes: { body: "new_body", title: "new_title" },
			})
			expect(isObject(res.at(0))).toEqual(true)
		})

		it("should allowed to override canUpdate option", async () => {
			const og = await tagRepo.findOne({})

			const ogName = og!.name
			const res = await tagRepo.updateWhere({
				where: og!.id,
				changes: { name: "new_name" },
			})
			expect(res[0]?.name).toEqual(ogName)
			expect(res[0]?.name).not.toEqual("new_name")

			const res2 = await tagRepo.updateWhere({
				where: og!.id,
				changes: { name: "new_name" },
				overrideCanUpdate: true,
			})
			expect(res2[0]?.name).not.toEqual(ogName)
			expect(res2[0]?.name).toEqual("new_name")
		})

		it("should use provided trx", async () => {
			try {
				await ormS.transaction({
					fn: async (trx) => {
						const updated = await repo.updateWhere({
							where: post1.id,
							changes: { title: "trx_title" },
							trx: trx as any,
						})
						expect(updated[0]?.title).toEqual("trx_title")
						throw new Error()
					},
				})
			} catch (error) {
				//
			}

			const inDb = await repo.findById({ id: post1.id })
			expect(inDb.title).not.toEqual("trx_title")
			expect.assertions(2)
		})
	})

	describe("deleteById", () => {
		let post: TPost
		beforeEach(async () => {
			post = TPostStub()
		})

		it("should pass data to update many with proper id", async () => {
			repo.deleteWhere = vi.fn(async () => [post])
			await repo.deleteById({
				id: post.id,
				trx: "hello_trx" as any,
			})
			expect(repo.deleteWhere).toBeCalledWith({
				where: post.id,
				trx: "hello_trx" as any,
			})
		})

		it("should throw if no record is updated", async () => {
			repo.deleteWhere = vi.fn(async () => [])
			const res = repo.deleteById({
				id: post.id,
			})
			await expect(res).rejects.toThrow(NotFoundException)
		})

		it("should return deleted record", async () => {
			repo.deleteWhere = vi.fn(async () => [{ ...post, title: "deleted" }])
			const res = await repo.deleteById({
				id: post.id,
			})
			expect(res).toEqual({ ...post, title: "deleted" })
		})
	})

	describe("deleteWhere", () => {
		let post1: TPost
		let post2: TPost

		beforeEach(async () => {
			post1 = await repo.createOne({ data: TPostStub() })

			post2 = await repo.createOne({ data: TPostStub() })
		})

		it("should delete record", async () => {
			await repo.deleteWhere({
				where: post1.id,
			})
			const deleted = await repo.findById({ id: post1.id }).catch((e) => undefined)
			expect(deleted).toBeUndefined()
		})
		//

		it("should return deleted records", async () => {
			const res = await repo.deleteWhere({
				where: post1.id,
			})
			expect(res).toEqual([post1])
		})

		it("should return plain object", async () => {
			const res = await repo.deleteWhere({
				where: post1.id,
			})
			expect(isObject(res.at(0))).toEqual(true)
		})

		it("should use provided trx", async () => {
			try {
				await ormS.transaction({
					fn: async (trx) => {
						await repo.deleteWhere({
							where: post1.id,
							trx: trx as any,
						})
						throw new Error()
					},
				})
			} catch (error) {
				//
			}

			const inDb = await repo.findById({ id: post1.id })
			expect(inDb).toBeDefined()
		})
	})
})
