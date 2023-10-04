/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { faker } from "@faker-js/faker"
import { snakeCase, times, uuidRegex } from "@zmaj-js/common"
import {
	BaseModel,
	Class,
	FieldCreateForbiddenError,
	FieldUpdateForbiddenError,
	GetCreateFields,
	InternalOrmProblem,
	NoChangesProvidedError,
	NoFieldsSelectedError,
	Orm,
	OrmRepository,
	RecordNotFoundError,
	UniqueError,
	ZmajOrmError,
} from "@zmaj-js/orm"
import {
	TComment,
	TCommentModel,
	TPost,
	TPostInfo,
	TPostInfoModel,
	TPostModel,
	TPostStub,
	TPostTag,
	TPostTagModel,
	TTag,
	TTagModel,
	createBlogTables,
} from "@zmaj-js/test-utils"
import { afterEach } from "node:test"
import { omit, pick, sort } from "radash"
import { DataTypes, QueryInterface } from "sequelize"
import { v4 } from "uuid"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { sqOrmEngine } from "./sq.orm-engine"
import { SequelizeService } from "./sq.service"

describe("SequelizeRepository", () => {
	let orm: Orm
	let sq: SequelizeService
	let postRepo: OrmRepository<TPostModel>
	let postInfoRepo: OrmRepository<TPostInfoModel>
	let tagRepo: OrmRepository<TTagModel>
	let commentRepo: OrmRepository<TCommentModel>
	let postTagRepo: OrmRepository<TPostTagModel>

	function repo<TModel extends BaseModel>(model: Class<TModel>): OrmRepository<TModel> {
		return orm.repoManager.getRepo(model)
	}

	function createPost(data?: Partial<TPost>): Promise<TPost> {
		return postRepo.createOne({
			data: omit(TPostStub(data), ["id", "createdAt"]),
		})
	}

	class TestModel extends BaseModel {
		name = "test_table"
		override tableName = "test_table"
		fields = this.buildFields((f) => ({
			id: f.intPk({}),
			name: f.text({}),
			default: f.text({ hasDefault: true }),
			noRead: f.text({ canRead: false }),
			noUpdate: f.text({ canUpdate: false }),
			noCreateDefault: f.text({
				canCreate: false,
				hasDefault: true,
			}),
			noUpdateDefault: f.text({
				canUpdate: false,
				hasDefault: true,
			}),
		}))

		static createStub() {
			return {
				name: faker.lorem.word(),
				// default: faker.lorem.lines(), //
				noRead: faker.lorem.word(),
				noUpdate: faker.lorem.word(),
				// noCreate: faker.lorem.word(),
				// noCreateDefault: faker.lorem.word(),
				noUpdateDefault: faker.lorem.word(),
			}
		}

		static async createTable(qi: QueryInterface): Promise<void> {
			await qi.createTable("test_table", {
				id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
				name: DataTypes.TEXT,
				default: { type: DataTypes.TEXT, defaultValue: "DefValue" },
				no_read: DataTypes.TEXT,
				// no_create: DataTypes.TEXT,
				no_update: DataTypes.TEXT,
				no_create_default: { type: DataTypes.TEXT, defaultValue: "Create!" },
				no_update_default: { type: DataTypes.TEXT, defaultValue: "Update!" },
			})
		}
	}

	const models: Class<BaseModel>[] = [
		TPostModel,
		TCommentModel,
		TTagModel,
		TPostInfoModel,
		TPostTagModel,
		TestModel,
	]

	beforeEach(async () => {
		orm = new Orm({
			config: {
				database: "",
				host: "",
				password: "",
				port: 10000,
				username: "",
				logging: false,
				// Force sqlite. Not fully supported, but lot simpler to test
				type: "sqlite" as any,
			},
			engine: sqOrmEngine,
			models,
			nameTransformer: ({ key }) => snakeCase(key),
		})
		await orm.init()
		sq = orm.engine.engineProvider as SequelizeService
		await sq.transaction({
			fn: async (trx) => {
				await createBlogTables(sq.orm.getQueryInterface(), trx)
			},
		})
		postRepo = orm.repoManager.getRepo(TPostModel)
		tagRepo = orm.repoManager.getRepo(TTagModel)
		postTagRepo = orm.repoManager.getRepo(TPostTagModel)
		commentRepo = orm.repoManager.getRepo(TCommentModel)
		postInfoRepo = orm.repoManager.getRepo(TPostInfoModel)
	})
	afterEach(async () => {
		// await sq.orm.getQueryInterface().dropAllTables()
		await orm.destroy()
	})

	it("should work setup", async () => {
		const res = await orm.rawQuery("SELECT * from posts")
		expect(res).toBeInstanceOf(Array)
	})

	describe("findWhere", () => {
		let uuid: string
		beforeEach(() => {
			uuid = faker.string.uuid()
		})

		describe("where", () => {
			it("should find by id", async () => {
				const post = await createPost()
				const res = await postRepo.findWhere({ where: post.id })
				expect(res).toEqual([post])
			})

			it("should find by ids", async () => {
				const posts = await Promise.all(times(2, (i) => createPost({ likes: i })))
				const res = await postRepo.findWhere({
					where: [posts[0]!.id, posts[1]!.id],
					orderBy: { createdAt: "ASC" },
				})
				expect(sort(res, (p) => p.likes)).toEqual(posts)
			})

			it("should find by equal filter", async () => {
				const post = await createPost({ body: uuid })
				const res = await postRepo.findWhere({
					where: { body: post.body },
				})
				expect(res).toEqual([post])
			})

			it("should find by multiple filters", async () => {
				const posts = await Promise.all(
					times(2, (i) =>
						createPost({
							body: uuid, //
							likes: i,
						}),
					),
				)
				const res = await postRepo.findWhere({
					where: { body: uuid, likes: 1 },
				})
				expect(res).toEqual([posts[1]])
			})

			it("should find by non eq filter", async () => {
				await Promise.all(
					times(6, (i) =>
						createPost({
							// every other will have uuid attached
							body: i % 2 ? faker.lorem.paragraph() + uuid : faker.lorem.paragraph(), //
						}),
					),
				)
				const withUuid = await postRepo.findWhere({
					where: {
						body: { $like: "%" + uuid },
					},
				})
				expect(withUuid.length).toEqual(3)
			})

			it("should allow combining filters", async () => {
				await Promise.all(
					times(6, (i) =>
						createPost({
							body: uuid,
							likes: 100_000 + i,
						}),
					),
				)

				const withUuid = await postRepo.findWhere({
					where: {
						body: uuid,
						likes: { $lte: 100_003 },
					},
				})
				expect(withUuid.length).toEqual(4)
			})

			it("should allow $and", async () => {
				const created = await Promise.all(
					times(6, (i) => createPost({ likes: i, body: uuid })),
				)

				const res = await postRepo.findWhere({
					where: {
						$and: [{ likes: 3 }, { body: uuid }],
					},
				})
				expect(res).toEqual([created[3]])
			})

			it("should allow $or", async () => {
				const created = await Promise.all(
					times(6, (i) => createPost({ likes: i, body: uuid })),
				)

				const res = await postRepo.findWhere({
					where: {
						$or: [{ likes: 3 }, { likes: 5 }],
					},
				})
				expect(res).toEqual([created[3], created[5]])
			})
		})

		/**
		 *
		 */
		describe("sort", () => {
			it("should sort", async () => {
				await Promise.all(times(5, (i) => createPost({ likes: i })))

				const res = await postRepo.findWhere({
					orderBy: { likes: "DESC" },
				})
				expect(res.map((p) => p.likes)).toEqual([4, 3, 2, 1, 0])
			})
		})

		describe("limit", () => {
			it("should limit", async () => {
				await Promise.all(times(5, () => createPost()))

				const res = await postRepo.findWhere({
					limit: 2,
				})
				expect(res).toHaveLength(2)
			})
		})

		describe("offset", () => {
			it("should offset", async () => {
				await Promise.all(times(5, (i) => createPost({ likes: i })))

				const res = await postRepo.findWhere({
					offset: 3,
					orderBy: { likes: "ASC" },
				})
				expect(res.map((p) => p.likes)).toEqual([3, 4])
			})
		})

		describe("fields", () => {
			// This should return empty object
			it("should throw an error if empty fields object is provided", async () => {
				await createPost()
				// @ts-expect-error
				await expect(postRepo.findWhere({ fields: {} })).rejects.toThrow(
					NoFieldsSelectedError,
				)
			})

			it("should return whole object if fields is undefined", async () => {
				const post = await createPost()
				const res = await postRepo.findWhere({ fields: undefined })
				expect(res).toEqual([post])
			})

			it("should return specified fields", async () => {
				const post = await createPost()
				const res = await postRepo.findWhere({
					fields: { body: true, likes: true }, //
				})
				expect(res).toEqual([pick(post, ["body", "likes"])])
			})

			it("should have no special treatment for id", async () => {
				const post = await createPost()
				const res = await postRepo.findWhere({ fields: { likes: true } })
				expect(res).toEqual([pick(post, ["likes"])])
			})

			describe("canRead=false", async () => {
				class WithHiddenModel extends BaseModel {
					name = "with_hidden"
					fields = this.buildFields((f) => ({
						id: f.intPk({}),
						firstName: f.text({ canRead: true }), //
						lastName: f.text({ canRead: false }), //
					}))
				}
				let repo: OrmRepository<WithHiddenModel>

				beforeEach(async () => {
					await sq.orm.getQueryInterface().createTable("with_hidden", {
						id: {
							type: DataTypes.INTEGER,
							autoIncrementIdentity: true,
							autoIncrement: true,
							primaryKey: true,
						},
						first_name: DataTypes.STRING,
						last_name: DataTypes.STRING,
					})

					orm.updateModels([...models, WithHiddenModel])
					repo = sq.repoManager.getRepo(WithHiddenModel)
				})

				it("should not return hidden fields", async () => {
					const created = await repo.createOne({
						data: {
							firstName: faker.person.firstName(),
							lastName: faker.person.lastName(),
						},
					})
					const res = await repo.findWhere({
						fields: {
							firstName: true,
							lastName: true,
							id: true, //
						},
					})
					expect(res).toEqual([{ id: created.id, firstName: created.firstName }])
				})

				// Currently it returns lastName: undefined
				it.skip("should omit hidden field, not return undefined", async () => {
					await repo.createOne({
						data: {
							firstName: faker.person.firstName(),
							lastName: faker.person.lastName(),
						},
					})
					const res = await repo.findWhere({
						fields: {
							firstName: true,
							lastName: true,
							id: true, //
						},
					})
					expect(Object.keys(res[0]!)).toEqual(["firstName", "id"])
				})
			})
		})

		describe("many to one", () => {
			let post: TPost
			let comment: TComment

			beforeEach(async () => {
				post = await createPost()
				comment = await commentRepo.createOne({
					data: { body: faker.lorem.paragraph(), postId: post.id },
				})
			})

			it("should be possible to get fk value without relation", async () => {
				// some ORMs (I think it was MikroORM), replace FK with relation
				// this test is in for just in case, we switch underlying ORM engine
				const com = await commentRepo.findWhere({ where: { id: comment.id } })
				expect(com).toEqual([
					{
						body: comment.body,
						id: comment.id,
						postId: post.id,
					} satisfies TComment,
				])
			})

			it("should be possible to get relation without returning any other field", async () => {
				const com = await commentRepo.findOne({
					where: { id: comment.id },
					fields: { post: true }, //
				})
				expect(com).toEqual({ post })
			})

			it("should be possible to get relation without returning FK", async () => {
				const com = await commentRepo.findOne({
					where: { id: comment.id },
					fields: { post: true }, //
				})
				expect(com).toEqual({ post })
			})

			it("should be possible to get relation without returning with some other field", async () => {
				const com = await commentRepo.findOne({
					where: { id: comment.id },
					fields: { body: true, post: true }, //
				})
				expect(com).toEqual({ post, body: comment.body })
			})

			it("should be possible to get relation and $fields", async () => {
				const com = await commentRepo.findOneOrThrow({
					where: { id: comment.id },
					fields: { post: true, $fields: true }, //
				})
				expect(com).toEqual({
					post,
					body: comment.body,
					id: comment.id,
					postId: comment.postId,
				})
			})

			it("should work recursively", async () => {
				const result = await commentRepo.findOne({
					where: {},
					fields: {
						postId: true,
						post: {
							id: true,
							comments: { id: true, post: true },
						},
					},
				})
				expect(result).toEqual({
					postId: post.id,
					post: {
						id: post.id,
						comments: [{ id: comment.id, post }],
					},
				})
			})
		})

		describe("owner one to one", () => {
			let post: TPost
			let info: TPostInfo

			class RefModel extends BaseModel {
				name = "ref"
				fields = {
					id: this.field.intPk({}),
				}
				main = this.oneToOneRef(() => NullableOwnerModel, { fkField: "rightId" })
			}
			class NullableOwnerModel extends BaseModel {
				name = "owner"
				fields = {
					id: this.field.intPk({}),
					rightId: this.field.uuid({ nullable: true }),
				}
				other = this.oneToOneOwner(() => RefModel, { fkField: "rightId" })
			}

			beforeEach(async () => {
				post = await createPost()
				info = await postInfoRepo.createOne({
					data: { additionalInfo: { hello: "world" }, postId: post.id },
				})

				await sq.qi.createTable("ref", {
					id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
				})

				await sq.qi.createTable("owner", {
					id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
					right_id: {
						type: DataTypes.INTEGER,
						references: { model: "ref", key: "id" },
					},
				})
				orm.updateModels([...models, RefModel, NullableOwnerModel])
			})

			it("should join properly", async () => {
				const res = await postInfoRepo.findById({
					id: info.id,
					fields: { id: true, additionalInfo: true, postId: true, post: true },
				})
				expect(res).toEqual({ ...info, post })
			})

			it("should work with $fields", async () => {
				const res = await postInfoRepo.findById({
					id: info.id,
					fields: { $fields: true, post: true },
				})
				expect(res).toEqual({ ...info, post })
			})

			it("should work specified fields", async () => {
				const res = await postInfoRepo.findById({
					id: info.id,
					fields: { additionalInfo: true, post: true },
				})
				expect(res).toEqual({ post, additionalInfo: info.additionalInfo })
			})

			it("should work without selected fields", async () => {
				const res = await postInfoRepo.findById({
					id: info.id,
					fields: { post: true },
				})
				expect(res).toEqual({ post })
			})

			it("should return null if relation does not exist ", async () => {
				// this can happen if FK column is null
				const created = await repo(NullableOwnerModel).createOne({ data: {} })
				const res = await repo(NullableOwnerModel).findById({
					id: created.id,
					fields: { other: true, id: true },
				})
				expect(res).toEqual({ id: created.id, other: null })
			})

			it("should work recursively", async () => {
				const result = await postInfoRepo.findOne({
					where: {},
					fields: {
						id: true,
						post: {
							likes: true,
							info: {
								postId: true,
								post: true,
							},
						},
					},
				})
				expect(result).toEqual({
					id: info.id,
					post: {
						likes: post.likes,
						info: {
							postId: info.postId,
							post: post,
						},
					},
				})
			})
		})

		describe("ref one to one", () => {
			let post: TPost
			let info: TPostInfo
			beforeEach(async () => {
				post = await createPost()
				info = await postInfoRepo.createOne({
					data: { postId: post.id, additionalInfo: { hello: "world" } },
				})
			})

			it("should return relation", async () => {
				const res = await postRepo.findById({
					id: post.id,
					fields: { id: true, info: true },
				})
				expect(res).toEqual({ id: post.id, info })
			})

			it("should return null if there is no relation", async () => {
				await postInfoRepo.deleteById({ id: info.id })

				const res = await postRepo.findById({
					id: post.id,
					fields: { id: true, info: true },
				})
				expect(res).toEqual({ id: post.id, info: null })
			})

			it("should work with $fields", async () => {
				const res = await postRepo.findById({
					id: post.id,
					fields: { $fields: true, info: true },
				})
				expect(res).toEqual({ ...post, info })
			})

			it("should work with no fields", async () => {
				const res = await postRepo.findById({
					id: post.id,
					fields: { info: true },
				})
				expect(res).toEqual({ info })
			})

			it("should work with specified fields", async () => {
				const res = await postRepo.findById({
					id: post.id,
					fields: { info: true, likes: true },
				})
				expect(res).toEqual({ info, likes: post.likes })
			})

			it("should allow recursion", async () => {
				const res = await postRepo.findById({
					id: post.id,
					fields: { likes: true, info: { post: { id: true }, postId: true, id: true } },
				})
				expect(res).toEqual({
					likes: post.likes,
					info: {
						postId: post.id,
						id: info.id,
						post: {
							id: post.id,
						},
					},
				})
				//
			})
		})

		describe("one to many", () => {
			let post: TPost
			let comments: TComment[]
			beforeEach(async () => {
				post = await createPost()
				// order is important for assertions
				comments = await Promise.all([
					commentRepo.createOne({
						data: { body: faker.lorem.sentence(), postId: post.id },
					}),
					commentRepo.createOne({
						data: { body: faker.lorem.sentence(), postId: post.id },
					}),
				])
			})

			it("should return joined relation", async () => {
				const result = await postRepo.findById({
					id: post.id,
					fields: { id: true, comments: true },
				})
				expect(result).toEqual({
					id: post.id,
					comments,
				})
			})
			it("should return empty array when there is no items", async () => {
				await commentRepo.deleteWhere({
					where: { id: { $in: comments.map((c) => c.id) } },
				})

				const result = await postRepo.findById({
					id: post.id,
					fields: { id: true, comments: true },
				})

				expect(result).toEqual({
					id: post.id,
					comments: [],
				})
			})
			it("should work with no fields", async () => {
				const result = await postRepo.findById({
					id: post.id,
					fields: { comments: true },
				})
				expect(result).toEqual({
					comments,
				})
			})

			it("should work with $fields", async () => {
				const result = await postRepo.findById({
					id: post.id,
					fields: { $fields: true, comments: true },
				})
				expect(result).toEqual({
					...post,
					comments,
				})
			})
			it("should work with specified fields", async () => {
				const result = await postRepo.findById({
					id: post.id,
					fields: { id: true, body: true, comments: true },
				})
				expect(result).toEqual({
					id: post.id,
					body: post.body,
					comments,
				})
			})
			it("should work recursively", async () => {
				const result = await postRepo.findById({
					id: post.id,
					fields: {
						id: true,
						body: true,
						comments: {
							id: true,
							post: { createdAt: true, comments: { postId: true } },
						},
					},
				})
				expect(result).toEqual({
					id: post.id,
					body: post.body,
					comments: comments.map((c) => ({
						id: c.id,
						post: {
							createdAt: post.createdAt,
							comments: comments.map((c) => ({ postId: c.postId })),
						},
					})),
				})
			})

			describe("overrideCanRead", () => {
				class PostHidden extends BaseModel {
					name = "posts"
					fields = this.buildFields((f) => ({
						id: f.uuidPk({}),
						title: f.text({}),
						body: f.text({ canRead: false }),
					}))
					comments = this.oneToMany(() => CommentHidden, { fkField: "postId" })
				}
				class CommentHidden extends BaseModel {
					name = "comments"
					fields = this.buildFields((f) => ({
						id: f.uuidPk({}),
						body: f.text({ canRead: false }),
						postId: f.uuid({}),
					}))
					post = this.manyToOne(() => PostHidden, { fkField: "postId" })
				}
				beforeEach(() => {
					orm.updateModels([PostHidden, CommentHidden])
				})

				// THIS IS IMPORTANT
				it("should not return canRead hidden fields", async () => {
					const res = await repo(PostHidden).findById({
						id: post.id,
						fields: {
							body: true,
							id: true,
							title: true,
							comments: {
								body: true,
								postId: true,
								id: true,
								post: {
									title: true,
									body: true,
								},
							},
						},
					})
					// Post and comments are created with another models, so they have hidden data
					expect(res).toEqual({
						id: post.id,
						title: post.title,
						body: undefined,
						comments: comments.map((c) => ({
							body: undefined,
							id: c.id,
							postId: c.postId,
							post: {
								title: post.title,
								body: undefined,
							},
						})),
					})
				})

				it.skip("should be possible to override canRead", async () => {
					const res = await repo(PostHidden).findById({
						id: post.id,
						includeHidden: true,
						fields: {
							body: true,
							id: true,
							title: true,
							comments: {
								body: true,
								postId: true,
								id: true,
								post: {
									title: true,
									body: true,
								},
							},
						},
					})

					// Post and comments are created with another models, so they have hidden data
					expect(res).toEqual({
						id: post.id,
						title: post.title,
						body: post.body,
						comments: comments.map((c) => ({
							body: c.body,
							id: c.id,
							postId: c.postId,
							post: {
								title: post.title,
								body: post.body,
							},
						})),
					})
				})
			})
		})
		describe("many to many", () => {
			let post: TPost
			let tags: TTag[]
			let postTags: TPostTag[]
			beforeEach(async () => {
				post = await createPost()
				tags = await tagRepo.createMany({
					data: times(4, (i) => ({ name: faker.lorem.word() + i })),
				})
				postTags = await postTagRepo.createMany({
					data: tags.slice(0, 2).map((t) => ({ postId: post.id, tagId: t.id })),
				})
			})

			it("should return joined relation", async () => {
				const result = await postRepo.findById({
					id: post.id,
					fields: { id: true, tags: true },
				})
				expect(result).toEqual({
					id: post.id,
					tags: tags.slice(0, 2),
				})
			})
			it("should return empty array when there is no items", async () => {
				await postTagRepo.deleteWhere({
					where: { postId: post.id },
				})

				const result = await postRepo.findById({
					id: post.id,
					fields: { id: true, comments: true },
				})

				expect(result).toEqual({
					id: post.id,
					comments: [],
				})
			})

			it("should work with no fields", async () => {
				const result = await postRepo.findById({
					id: post.id,
					fields: { tags: true },
				})
				expect(result).toEqual({
					tags: tags.slice(0, 2),
				})
			})

			it("should work with $fields", async () => {
				const result = await postRepo.findById({
					id: post.id,
					fields: { $fields: true, tags: true },
				})
				expect(result).toEqual({
					...post,
					tags: tags.slice(0, 2),
				})
			})
			it("should work with specified fields ", async () => {
				const result = await postRepo.findById({
					id: post.id,
					fields: { id: true, body: true, tags: true },
				})
				expect(result).toEqual({
					id: post.id,
					body: post.body,
					tags: tags.slice(0, 2),
				})
			})
			it("should work recursively", async () => {
				const thisTags = tags.slice(0, 2)
				const result = await postRepo.findById({
					id: post.id,
					fields: {
						id: true,
						tags: {
							id: true,
							posts: { id: true },
						},
					},
				})

				expect(result).toEqual({
					id: post.id,
					tags: thisTags.map((t) => ({
						id: t.id,
						posts: [{ id: post.id }],
					})),
				})
			})
			// TODO FIXME THIS IS IMPORTANT
			it.todo("canRead should be used for nested")
		})
	})

	describe("create", () => {
		describe("createOne", () => {
			beforeEach(() => {
				postRepo.createMany = vi.fn()
			})

			it("should call createMany", async () => {
				vi.mocked(postRepo.createMany).mockImplementation(async () => ["RESULT" as never])
				const res = await postRepo.createOne({
					data: { likes: 5 } as never,
					// @ts-expect-error
					test: "ME",
				})
				expect(res).toEqual("RESULT")
				expect(postRepo.createMany).toBeCalledWith({
					data: [{ likes: 5 }],
					test: "ME",
				})
			})

			it("should throw if params data is array", async () => {
				vi.mocked(postRepo.createMany).mockResolvedValue([])
				await expect(postRepo.createOne({ data: [] as never })).rejects.toThrow(
					ZmajOrmError,
				)
			})

			it("should throw if params data is not object", async () => {
				vi.mocked(postRepo.createMany).mockResolvedValue([])
				await expect(postRepo.createOne({ data: "hello" as never })).rejects.toThrow(
					ZmajOrmError,
				)
			})

			it("should throw if result is not single record", async () => {
				vi.mocked(postRepo.createMany).mockResolvedValue([])
				await expect(postRepo.createOne({ data: {} as never })).rejects.toThrow(
					InternalOrmProblem,
				)
			})
		})

		describe("createMany", () => {
			beforeEach(async () => {
				await TestModel.createTable(sq.qi)
			})

			const y2020 = new Date(2020, 1)
			function randPostStub(): GetCreateFields<TPostModel, false> {
				return {
					body: faker.lorem.paragraph(),
					likes: faker.number.int(),
					title: faker.lorem.word(),
				}
			}

			it("should create many record", async () => {
				const data = times(3, () => randPostStub())
				await postRepo.createMany({ data })
				const res = await postRepo.findWhere({})
				expect(res).toMatchObject(data)
			})

			it("should return created records", async () => {
				const data = times(3, () => randPostStub())
				const res = await postRepo.createMany({ data })
				expect(sort(res, (p) => p.likes)).toMatchObject(sort(data, (p) => p.likes))
			})

			it("should use createdAt", async () => {
				const res = await postRepo.createMany({
					data: [randPostStub()],
				})
				const savedYear = res[0]!.createdAt
				expect(savedYear.getTime()).toBeGreaterThan(Date.now() - 2000)
			})

			it("should throw if createdAt value is provided", async () => {
				await expect(
					postRepo.createMany({
						data: [{ ...randPostStub(), createdAt: y2020 as never }],
					}),
				).rejects.toThrow(FieldCreateForbiddenError)
			})

			it("should throw if provided data that is canCreate=false", async () => {
				await expect(
					repo(TestModel).createMany({
						data: [
							{
								...TestModel.createStub(),
								noCreateDefault: "HelloWorld!" as never,
							},
						],
					}),
				).rejects.toThrow(FieldCreateForbiddenError)
			})

			it("should allow to override canCreate", async () => {
				const res = await repo(TestModel).createMany({
					overrideCanCreate: true,
					data: [{ ...TestModel.createStub(), noCreateDefault: "HelloWorld!" }],
				})
				expect(res[0]!.noCreateDefault).toEqual("HelloWorld!")
			})

			it("should use default value if data value is null", async () => {
				const res = await repo(TestModel).createMany({
					data: [{ ...TestModel.createStub(), default: null }],
				})
				expect(res[0]!.default).toEqual("DefValue")
			})

			it("should use default value if data value is undefined", async () => {
				const res = await repo(TestModel).createMany({
					data: [{ ...TestModel.createStub(), default: undefined }],
				})
				expect(res[0]!.default).toEqual("DefValue")
			})

			it("should return all fields that have do not have canRead=false", async () => {
				const res = await repo(TestModel).createMany({
					data: [TestModel.createStub()],
				})
				expect(res[0]!.noRead).toBeUndefined()
			})

			it("should throw UniqueError if needed", async () => {
				const model = new TestModel()

				await sq.qi.changeColumn(model.tableName, "name", {
					unique: true,
					type: DataTypes.TEXT,
				})
				const [first] = await repo(TestModel).createMany({
					data: [TestModel.createStub()],
				})
				expect(first).toBeDefined()

				await expect(
					repo(TestModel).createMany({
						data: [{ ...TestModel.createStub(), name: first!.name }],
					}),
				).rejects.toThrow(UniqueError)
			})

			it("should handle setting UUID", async () => {
				const [first] = await postRepo.createMany({
					data: [{ body: "Hello", likes: 5, title: "World" }],
				})
				expect(first?.id).toMatch(uuidRegex)
			})

			it("should allow for user to provide it's uuid", async () => {
				const uuid = v4()
				const [first] = await postRepo.createMany({
					overrideCanCreate: true,
					data: [{ body: "Hello", likes: 5, title: "World", id: uuid }],
				})
				expect(first?.id).toEqual(uuid)
			})

			it("should return dates as Date object", async () => {
				const [first] = await postRepo.createMany({
					data: [{ body: "Hello", likes: 5, title: "World" }],
				})
				expect(first?.createdAt).toBeInstanceOf(Date)
			})

			it("should use provided transaction", async () => {
				await orm
					.transaction({
						fn: async (trx) => {
							await postRepo.createMany({
								data: [{ body: "Hello", likes: 5, title: "World" }],
								trx,
							})
							throw new Error("Prevent saving")
						},
					})
					.catch(() => {})
				const inDb = await postRepo.findWhere({})
				expect(inDb).toHaveLength(0)
			})
		})
	})

	describe("update", () => {
		describe("updateById", () => {
			const id = v4()

			beforeEach(async () => {
				postRepo.updateWhere = vi.fn(async () => [{ test: id } as any])
			})

			it("should call updateWhere in proper format", async () => {
				await postRepo.updateById({
					id,
					trx: "TRX" as never,
					changes: { body: "hello" },
					overrideCanUpdate: false,
				})
				expect(postRepo.updateWhere).toBeCalledWith({
					where: id,
					trx: "TRX",
					changes: { body: "hello" },
					overrideCanUpdate: false,
				})
			})
			it("should throw NotFound if item does not exist", async () => {
				vi.mocked(postRepo.updateWhere).mockResolvedValue([])
				await expect(
					postRepo.updateById({ id, changes: { body: "hello" } }),
				).rejects.toThrow(RecordNotFoundError)
			})

			it("should return response from findWhere", async () => {
				const result = await postRepo.updateById({
					id,
					changes: { body: "hello" },
				})
				expect(result).toEqual({ test: id })
			})
		})

		describe("updateWhere", () => {
			let posts: [TPost, TPost]

			beforeEach(async () => {
				await TestModel.createTable(sq.qi)
				posts = await Promise.all([createPost({ likes: 1 }), createPost({ likes: 2 })])
			})

			it("should update records", async () => {
				const uuid = v4()

				await postRepo.updateWhere({
					changes: { body: uuid },
					where: { id: { $ne: v4() } },
				})

				const found = await postRepo.findWhere({
					orderBy: { likes: "ASC" }, //
				})
				expect(found).toMatchObject(posts.map((p) => ({ ...p, body: uuid })))
			})
			it("should return updated records", async () => {
				const uuid = v4()

				const updated = await postRepo.updateWhere({
					changes: { body: uuid },
					where: { id: { $ne: v4() } },
				})

				expect(sort(updated, (p) => p.likes)).toMatchObject(
					posts.map((p) => ({ ...p, body: uuid })),
				)
			})
			it("should throw if canUpdate=false field provided", async () => {
				const testRepo = repo(TestModel)
				await testRepo.createOne({ data: TestModel.createStub() })
				await expect(
					testRepo.updateWhere({
						where: { id: { $ne: 400000 } },
						changes: { noUpdate: "Hello" as never },
					}),
				).rejects.toThrow(FieldUpdateForbiddenError)
			})
			it("should allow to override canUpdate", async () => {
				const testRepo = repo(TestModel)
				const created = await testRepo.createOne({ data: TestModel.createStub() })
				const updated = await testRepo.updateWhere({
					where: { id: { $ne: 400000 } },
					changes: { noUpdate: "NewValue" },
					overrideCanUpdate: true,
				})
				expect(updated).toMatchObject([{ ...created, noUpdate: "NewValue" }])
			})

			it("should use provided transaction", async () => {
				const testRepo = repo(TestModel)
				const created = await testRepo.createOne({ data: TestModel.createStub() })
				await orm
					.transaction({
						fn: async (trx) => {
							await testRepo.updateWhere({
								where: { id: { $ne: 400000 } },
								changes: { name: "NewValue" },
								trx,
							})
							throw new Error("Prevent updating")
						},
					})
					.catch(() => {})
				const afterTrx = await testRepo.findWhere({})
				expect(afterTrx).toEqual([created])
			})

			it("should throw if empty object is provided", async () => {
				const testRepo = repo(TestModel)
				await testRepo.createOne({ data: TestModel.createStub() })
				await expect(
					testRepo.updateWhere({
						where: { id: { $ne: 400000 } },
						changes: {},
					}),
				).rejects.toThrow(NoChangesProvidedError)
			})
		})
	})

	describe("delete", () => {
		describe("deleteById", () => {
			const id = v4()

			beforeEach(async () => {
				postRepo.deleteWhere = vi.fn(async () => [{ test: id } as any])
			})

			it("should call deleteWhere in proper format", async () => {
				await postRepo.deleteById({ id, trx: "TRX" as never })
				expect(postRepo.deleteWhere).toBeCalledWith({ where: id, trx: "TRX" })
			})
			it("should throw NotFound if item does not exist", async () => {
				vi.mocked(postRepo.deleteWhere).mockResolvedValue([])
				await expect(postRepo.deleteById({ id, trx: "TRX" as never })).rejects.toThrow(
					RecordNotFoundError,
				)
			})

			it("should return response from findWhere", async () => {
				const result = await postRepo.deleteById({ id, trx: "TRX" as never })
				expect(result).toEqual({ test: id })
			})
		})

		describe("deleteWhere", () => {
			let posts: TPost[]

			beforeEach(async () => {
				posts = await Promise.all(times(4, (i) => createPost({ likes: i })))
			})

			it("should delete items", async () => {
				await postRepo.deleteWhere({ where: { likes: { $lte: 1 } } })
				const remaining = await postRepo.findWhere({})
				expect(remaining).toHaveLength(2)
			})

			it("should return deleted items", async () => {
				const deleted = await postRepo.deleteWhere({ where: { likes: { $gte: 2 } } })

				expect(deleted).toMatchObject(posts.slice(2))
			})

			it("should use provided trx", async () => {
				await orm
					.transaction({
						fn: async (trx) => {
							await postRepo.deleteWhere({ where: { likes: 0 }, trx })
							throw new Error("Prevent deleting")
						},
					})
					.catch(() => {})
				const inDb = await postRepo.findWhere({})
				expect(inDb).toHaveLength(posts.length)
			})

			it.todo("should return custom error")
			it.todo("should return special error for FK error")
		})
	})

	describe("findOne", () => {
		it("should call findMany with correct params", async () => {
			const mockPost = TPostStub()
			postRepo.findWhere = vi.fn(async () => [mockPost as never])

			const res = await postRepo.findOne({
				fields: { body: true, tags: { id: true } },
				orderBy: { likes: "ASC" },
				where: { body: { $ne: "Hello" } },
				trx: "TRX" as any,
			})
			expect(res).toEqual(mockPost)
			expect(postRepo.findWhere).toBeCalledWith({
				fields: { body: true, tags: { id: true } },
				orderBy: { likes: "ASC" },
				where: { body: { $ne: "Hello" } },
				trx: "TRX" as any,
				limit: 1,
			})
		})
		it("should return undefined if there is no record", async () => {
			//
			postRepo.findWhere = vi.fn(async () => [])
			const res = await postRepo.findOne({})
			expect(res).toBeUndefined()
		})
	})

	describe("findOneOrThrow", () => {
		it("should call findOne with correct params", async () => {
			const mockPost = TPostStub()
			postRepo.findOne = vi.fn(async () => mockPost as never)

			const res = await postRepo.findOneOrThrow("any_params" as never)
			expect(res).toEqual(mockPost)
			expect(postRepo.findOne).toBeCalledWith("any_params")
		})

		it("should throw if there is no record", async () => {
			postRepo.findOne = vi.fn(async () => undefined)
			await expect(postRepo.findOneOrThrow({})).rejects.toThrow()
		})
	})

	describe("rawQuery", () => {
		beforeEach(async () => {
			await createPost()
		})

		it("should not make any modification to response", async () => {
			const res = await postRepo.rawQuery("select * from posts;")
			expect(res).toMatchObject([{ created_at: expect.any(String) }])
		})

		it("should not transform casing", async () => {
			const res = await postRepo.rawQuery("select * from posts;")
			expect(res).not.toMatchObject([{ createdAt: expect.anything() }])
		})
	})
})
