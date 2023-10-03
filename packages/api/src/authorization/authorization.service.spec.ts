import { InfraStateService } from "@api/infra/infra-state/infra-state.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { AnyMongoAbility, defineAbility } from "@casl/ability"
import { ForbiddenException } from "@nestjs/common"
import { TestingModule } from "@nestjs/testing"
import { AuthUser, asMock, camelCaseKeys, codeCollection } from "@zmaj-js/common"
import { BaseModel } from "@zmaj-js/orm"
import {
	AuthUserStub,
	CollectionDefStub,
	TComment,
	TCommentStub,
	TPost,
	TPostInfo,
	TPostInfoStub,
	TPostStub,
	mockCollectionDefs,
} from "@zmaj-js/test-utils"
import { pick } from "radash"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthorizationConfig } from "./authorization.config"
import { AuthorizationService } from "./authorization.service"

describe("AuthorizationService", () => {
	let module: TestingModule
	let service: AuthorizationService
	let authzConfig: AuthorizationConfig
	let infraState: InfraStateService
	let user: AuthUser

	beforeEach(async () => {
		module = await buildTestModule(AuthorizationService, [
			{
				provide: AuthorizationConfig,
				useValue: new AuthorizationConfig({ exposeAllowedPermissions: true }),
			},
		]).compile()

		user = AuthUserStub()
		service = module.get(AuthorizationService)
		//
		infraState = module.get(InfraStateService)
		//
		authzConfig = module.get(AuthorizationConfig)
	})

	it("should be defined", () => {
		expect(service).toBeInstanceOf(AuthorizationService)
	})

	describe("getResourceName", () => {
		it("should get resource name if string", () => {
			const name = service["getResourceName"]("hello.world")
			expect(name).toEqual("hello.world")
		})

		it("should default to collection if no dot is provided", () => {
			const name = service["getResourceName"]("hello")
			expect(name).toEqual("collections.hello")
		})

		it("should get resource name infra collection", () => {
			class WorldModel extends BaseModel {
				name = "world"
				fields = this.buildFields((f) => ({}))
			}
			const col = codeCollection(WorldModel, {
				relations: {},
				options: { authzKey: "test.me" },
			})
			const name = service["getResourceName"](col)
			expect(name).toEqual("test.me")
		})
	})

	/**
	 *
	 */
	describe("canModifyRecord", () => {
		beforeEach(() => {
			service.check = vi.fn().mockReturnValue(true)
		})

		it("should check if all changes user is allowed to write", () => {
			const res = service.canModifyRecord({
				action: "update",
				changes: { name: "test", id: 5 },
				resource: "test_table",
				user,
				record: { test: "me" },
			})
			expect(service.check).toBeCalledWith({
				action: "update",
				resource: "test_table",
				user,
				field: ["name", "id"],
				record: { test: "me" },
			})

			expect(res).toBe(true)
		})

		it("should return true only if user can change all fields", () => {
			asMock(service.check).mockReturnValueOnce(false)

			const res = service.canModifyRecord({
				action: "update",
				resource: "test_table",
				user,
				changes: { id: 1, name: "two", three: "four" },
				record: { test: "me" },
			})
			expect(res).toEqual(false)
		})
	})

	/**
	 *
	 */
	describe("canModifyResource", () => {
		beforeEach(() => {
			service.check = vi.fn().mockReturnValue(true)
		})
		it("should check if all changes are allowed to write", () => {
			const res = service.canModifyResource({
				action: "update",
				changes: { name: "test", id: 5 },
				resource: "test_table",
				user,
			})
			expect(service.check).toBeCalledWith({
				action: "update",
				resource: "test_table",
				user,
				field: ["name", "id"],
			})

			expect(res).toBe(true)
		})

		it("should return true only if user can change all fields", () => {
			asMock(service.check).mockReturnValueOnce(false)

			const res = service.canModifyResource({
				action: "update",
				resource: "test_table",
				user,
				changes: { id: 1, name: "two", three: "four" },
			})
			expect(res).toEqual(false)
		})
	})

	/**
	 *
	 */
	describe("checkSystem", () => {
		beforeEach(() => {
			service.check = vi.fn().mockReturnValue(true)
		})
		//
		it("should check system permission", () => {
			service.checkSystem("files", "create", { user, record: { id: 5 } })
			expect(service.check).toBeCalledWith({
				user,
				record: { id: 5 },
				action: "create",
				resource: "zmaj.files",
			})
		})

		it("should return result for checking system permission", () => {
			const res = service.checkSystem("files", "create", { user, record: { id: 5 } })
			expect(res).toEqual(true)
		})
	})

	/**
	 *
	 */
	describe("check", () => {
		let casl: AnyMongoAbility
		beforeEach(() => {
			casl = { can: vi.fn().mockReturnValue("casl_boolean_response") } as any
			service.getRules = vi.fn().mockReturnValue(casl)
		})

		it("should check permissions only for current user", () => {
			service.check({ action: "update", resource: "collections.testTable", user })
			expect(service.getRules).toBeCalledWith({
				action: "update",
				resource: "collections.testTable",
				user,
			})
		})

		it("should check if action is allowed", () => {
			service.check({ action: "update", resource: "collections.testTable", user })
			expect(casl.can).toBeCalledWith("update", "collections.testTable")
		})

		it("should allow to pass infra collection instead of resource", () => {
			const resource = CollectionDefStub({
				tableName: "test_table",
				authzKey: "collections.testTable",
			})
			service.check({ action: "update", resource, user })
			expect(casl.can).toBeCalledWith("update", "collections.testTable")
		})

		//
		it("should check if specific record is allowed", () => {
			const record = { name: "test" }
			service.check({
				action: "update",
				resource: "collections.testTable",
				user,
				record,
				field: "field1",
			})
			expect(casl.can).toBeCalledWith(
				"update",
				{ ...record, __caslType: "collections.testTable" },
				"field1",
			)
		})

		it("should check if action on field is allowed", () => {
			service.check({
				action: "update",
				resource: "collections.testTable",
				field: "my_field",
				user,
			})
			expect(casl.can).toBeCalledWith("update", "collections.testTable", "my_field")
		})

		it("should check if action on multiple fields is allowed", () => {
			service.check({
				action: "update",
				resource: "collections.testTable",
				field: ["my_field", "my_second"],
				user,
			})
			expect(casl.can).toBeCalledWith("update", "collections.testTable", "my_field")
			expect(casl.can).toBeCalledWith("update", "collections.testTable", "my_second")
		})

		it("should return is action allowed or not", () => {
			const res = service.check({ action: "update", resource: "collections.testTable", user })
			expect(res).toEqual("casl_boolean_response")
		})
	})

	/**
	 *
	 */
	describe("getRuleConditions", () => {
		it("should get conditions", () => {
			service.getRules = vi.fn().mockImplementation(() => {
				return defineAbility((can) => {
					can("read", "collections.users", { cond: 1 })
					can("update", "collections.users", { cond: 2 })
					can("read", "collections.posts", { cond: 2 })
				})
			})
			const res = service.getAuthzAsOrmFilter({
				action: "read",
				resource: "collections.users",
				user,
			})
			expect(service.getRules).toBeCalledWith({
				action: "read",
				resource: "collections.users",
				user,
			})
			expect(res).toEqual({ $and: [{ cond: 1 }] })
		})

		it("should return empty $and array if user can't access this resource", () => {
			// not job of this method to check if user is allowed
			// so we simply do not provide any conditions
			service.getRules = vi.fn().mockImplementation(() => {
				return defineAbility((can) => {
					can("read", "users")
				})
			})
			const res = service.getAuthzAsOrmFilter({ action: "read", resource: "forbidden", user })
			expect(res).toEqual({ $and: [] })
		})

		it("should return empty $and array if there are no conditions for current rule", () => {
			service.getRules = vi.fn().mockImplementation(() => {
				return defineAbility((can) => {
					can("read", "users")
				})
			})
			const res = service.getAuthzAsOrmFilter({ action: "read", resource: "users", user })
			expect(res).toEqual({ $and: [] })
		})
	})

	// /**
	//  *
	//  */
	// describe("getAllowedActions", () => {
	// 	beforeEach(() => {
	// 		authzConfig.exposeAllowedPermissions = true
	// 		service.checkSystem = vi.fn(() => true)
	// 		service.getRules = vi.fn(() => defineAbility((can) => can("manage", "all")))
	// 	})
	// 	// it("should throw if actions are not exposed", () => {
	// 	// 	authzConfig.exposeAllowedPermissions = false
	// 	// 	expect(() => service.getAllowedActions(user)).toThrow(ForbiddenException)
	// 	// })
	// 	it("should return empty array if not allowed to expose", () => {
	// 		authzConfig.exposeAllowedPermissions = false
	// 		const res = service.getAllowedActions(user)
	// 		expect(res).toEqual([])
	// 	})

	// 	it("should return empty array if current role is not allowed", () => {
	// 		asMock(service.checkSystem).mockReturnValue(false)
	// 		expect(service.getAllowedActions(user)).toEqual([])
	// 	})

	// 	it("should return null if user is admin", () => {
	// 		user.roleId = ADMIN_ROLE_ID
	// 		expect(service.getAllowedActions(user)).toBeNull()
	// 	})

	// 	it("should get allowed actions for user", () => {
	// 		service.getRules = () => {
	// 			return defineAbility((can) => {
	// 				can("read", "r1", ["f1"])
	// 				can("update", "r2", ["f2"])
	// 			})
	// 		}
	// 		//
	// 		const res = service.getAllowedActions(user)
	// 		expect(res).toEqual([
	// 			{ action: "read", fields: ["f1"], resource: "r1" }, //
	// 			{ action: "update", fields: ["f2"], resource: "r2" }, //
	// 		])
	// 	})

	// 	it("should get public actions when not signed in", () => {
	// 		service.getRules = () => {
	// 			return defineAbility((can) => {
	// 				can("read", "r1", ["f1"])
	// 			})
	// 		}

	// 		const res = service.getAllowedActions()
	// 		expect(res).toEqual([
	// 			{ action: "read", fields: ["f1"], resource: "r1" }, //
	// 		])
	// 	})
	// })

	/**
	 *
	 */
	describe("pickAllowedData", () => {
		let postStub: TPost
		let user: AuthUser
		const postCol = mockCollectionDefs.posts

		beforeEach(() => {
			user = AuthUserStub()
			postStub = TPostStub({
				body: "my_body",
				createdAt: new Date(),
				likes: 33,
				title: "hello",
			})
			infraState["_collections"] = camelCaseKeys(mockCollectionDefs)
		})

		it("should return allowed data if fields not specified", () => {
			service.check = vi.fn((v) => v.field === "body")
			const res = service.pickAllowedData({ resource: postCol, record: postStub })
			expect(res).toEqual({ body: "my_body" })
		})

		it("should return allowed data if fields is empty object", () => {
			service.check = vi.fn((v) => v.field === "body")
			const res = service.pickAllowedData({ resource: postCol, record: postStub, fields: {} })
			expect(res).toEqual({ body: "my_body" })
		})

		it("should check every value", () => {
			service.check = vi.fn().mockReturnValue(true)
			service.pickAllowedData({ resource: postCol, record: postStub, fields: {}, user })
			const common = { user, resource: "collections.posts", action: "read", record: postStub }
			expect(service.check).toBeCalledWith({ ...common, field: "body" })
			expect(service.check).toBeCalledWith({ ...common, field: "createdAt" })
			expect(service.check).toBeCalledWith({ ...common, field: "id" })
			expect(service.check).toBeCalledWith({ ...common, field: "likes" })
			expect(service.check).toBeCalledWith({ ...common, field: "title" })
		})

		it("should return allowed data", () => {
			service.check = vi.fn((v) => v.field === "body" || v.field === "id")
			const res = service.pickAllowedData({ resource: postCol, record: postStub })
			expect(res).toEqual({ body: postStub.body, id: postStub.id })
		})

		it("should return only specified field", () => {
			service.check = vi.fn((v) => v.field === "body" || v.field === "id")
			const res = service.pickAllowedData({
				resource: postCol,
				record: postStub,
				fields: { id: true },
			})
			expect(res).toEqual({ id: postStub.id })
		})

		it("should return whole object if property is object (json) but not relation", () => {
			// don't check sub properties if value is not type in db
			service.check = vi.fn((v) => v.field === "body" || v.field === "id")
			const res = service.pickAllowedData({
				resource: postCol,
				record: { ...postStub, body: { hello: "world" } },
				fields: { id: true, body: true },
			})
			expect(res).toEqual({ id: postStub.id, body: { hello: "world" } })
		})

		it("should throw if required field is forbidden", () => {
			service.check = vi.fn((v) => v.field === "body" || v.field === "id")
			expect(() =>
				service.pickAllowedData({
					resource: postCol,
					record: postStub,
					fields: { title: true },
				}),
			).toThrow(ForbiddenException)
		})

		/**
		 *
		 */
		describe("relations", () => {
			let postInfoStub: TPostInfo
			const postCol = mockCollectionDefs.posts

			beforeEach(() => {
				postInfoStub = TPostInfoStub({
					additionalInfo: { hello: "world" },
					postId: postStub.id,
				})

				postStub.postInfo = postInfoStub

				service.check = vi.fn((v) => {
					if (v.resource === "collections.posts") {
						return v.field === "body" || v.field === "id"
					}
					if (v.resource === "collections.comments") {
						return v.field === "id" || v.field === "body"
					}
					if (v.resource === "collections.postsInfo") {
						console.log({ v })

						return v.field === "id" || v.field === "additionalInfo"
					}
					return false
				})
			})

			it("should return what is allowed if relation field is `true`", () => {
				const data = service.pickAllowedData({
					resource: postCol,
					record: postStub,
					fields: { body: true, postInfo: true },
				})
				expect(data).toEqual({
					body: "my_body",
					postInfo: {
						id: postInfoStub.id,
						additionalInfo: { hello: "world" },
					},
				})
			})

			it("should return specified fields in relation", () => {
				const data = service.pickAllowedData({
					resource: postCol,
					record: postStub,
					fields: { body: true, postInfo: { additionalInfo: true } as any },
				})
				expect(data.postInfo).toEqual({ additionalInfo: { hello: "world" } })
			})

			it("should throw if specified field in relation is forbidden", () => {
				expect(() =>
					service.pickAllowedData({
						resource: postCol,
						record: postStub,
						fields: { body: true, postInfo: { postId: true } as any },
					}),
				).toThrow(ForbiddenException)

				//
			})

			it("should ignore if relation value is not an object or array", () => {
				postStub.postInfo = "hello" as any
				const res = service.pickAllowedData({
					resource: postCol,
					record: postStub,
					fields: { body: true, postInfo: { postId: true } as any },
				})

				expect(res).toEqual({ body: postStub.body })
			})

			it("should check relation properly (recursively)", () => {
				const spy = vi.spyOn(service, "pickAllowedData")
				service.pickAllowedData({
					resource: postCol,
					record: postStub,
					fields: { body: true, postInfo: { id: true } as any },
				})
				// expect(res.postInfo).toEqual("hello")
				expect(spy).nthCalledWith(2, {
					fields: { id: true },
					record: postInfoStub,
					resource: mockCollectionDefs.posts_info,
					user: undefined,
				})
			})

			it("should get only if specified", () => {
				const res = service.pickAllowedData({
					resource: postCol,
					record: postStub,
					fields: { body: true },
				})
				expect(res.postInfo).toBeUndefined()
			})

			describe("one to many", () => {
				let comments: TComment[]
				beforeEach(() => {
					postStub.postInfo = undefined
					comments = [
						TCommentStub({ body: "hello1", postId: postStub.id }),
						TCommentStub({ body: "hello2", postId: postStub.id }),
					]
					postStub.comments = comments
				})

				it("should check every property if value is array", () => {
					const res = service.pickAllowedData({
						resource: postCol,
						record: postStub,
						fields: { body: true, comments: true },
					})

					expect(res.comments).toEqual(comments.map((c) => pick(c, ["id", "body"])))
				})

				it("should not get value if unspecified", () => {
					const res = service.pickAllowedData({
						resource: postCol,
						record: postStub,
						fields: { body: true, postInfo: true },
					})

					expect(res.comments).toEqual(undefined)
				})

				it("should check relation properly", () => {
					const spy = vi.spyOn(service, "pickAllowedData")
					service.pickAllowedData({
						resource: postCol,
						record: postStub,
						fields: { body: true, comments: { id: true } },
					})
					expect(spy).nthCalledWith(2, {
						fields: {
							id: true,
						},
						record: comments[0],
						resource: mockCollectionDefs.comments,
						user: undefined,
					})
					expect(spy).nthCalledWith(3, {
						fields: {
							id: true,
						},
						record: comments[1],
						resource: mockCollectionDefs.comments,
						user: undefined,
					})
				})
			})
		})
	})
})
