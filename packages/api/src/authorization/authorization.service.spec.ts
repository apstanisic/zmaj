import { PermissionStub } from "@api/authorization/permissions/permissions.stub"
import { InfraStateService } from "@api/infra/infra-state/infra-state.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { AnyMongoAbility, defineAbility } from "@casl/ability"
import { ForbiddenException, InternalServerErrorException } from "@nestjs/common"
import { rand } from "@ngneat/falso"
import {
	ADMIN_ROLE_ID,
	AuthUser,
	BaseModel,
	EntityRef,
	PUBLIC_ROLE_ID,
	Permission,
	asMock,
	camelCaseKeys,
	defineCollection,
	times,
} from "@zmaj-js/common"
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
import { addDays, differenceInHours } from "date-fns"
import { pick } from "radash"
import { v4 } from "uuid"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthorizationConfig } from "./authorization.config"
import { AuthorizationService } from "./authorization.service"
import { AuthorizationState } from "./authorization.state"
import { RoleStub } from "./roles/role.stub"

describe("AuthorizationService", () => {
	let service: AuthorizationService
	let authzState: AuthorizationState
	let authzConfig: AuthorizationConfig
	let infraState: InfraStateService
	let user: AuthUser

	beforeEach(async () => {
		const module = await buildTestModule(AuthorizationService, [
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
		//
		authzState = module.get(AuthorizationState)
		authzState.roles = times(5, (i) => RoleStub({ name: `role_${i}` }))
		authzState.permissions = times(30, () =>
			PermissionStub({
				roleId: rand(authzState.roles.map((r) => r.id)),
			}),
		)
	})

	it("should be defined", () => {
		expect(service).toBeInstanceOf(AuthorizationService)
	})

	describe("getResourceName", () => {
		it("should get resource name if string", () => {
			const name = service["getResourceName"]("hello")
			expect(name).toEqual("hello")
		})

		it("should get resource name infra collection", () => {
			const col = defineCollection(
				class WorldModel extends BaseModel {
					name = "world"
					fields = this.buildFields((f) => ({}))
				},
				{
					options: { authzKey: "test.me" },
				},
			)
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
				field: "name",
				record: { test: "me" },
			})

			expect(service.check).toBeCalledWith({
				action: "update",
				resource: "test_table",
				user,
				field: "id",
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
				field: "name",
			})

			expect(service.check).toBeCalledWith({
				action: "update",
				resource: "test_table",
				user,
				field: "id",
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
			expect(service.getRules).toBeCalledWith(user)
		})

		it("should check if action is allowed", () => {
			service.check({ action: "update", resource: "collections.testTable", user })
			expect(casl.can).toBeCalledWith("update", "collections.testTable", undefined)
		})

		it("should allow to pass infra collection instead of resource", () => {
			const resource = CollectionDefStub({
				tableName: "test_table",
				authzKey: "collections.testTable",
			})
			service.check({ action: "update", resource, user })
			expect(casl.can).toBeCalledWith("update", "collections.testTable", undefined)
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
			const res = service.getRuleConditions({ action: "read", resource: "collections.users", user })
			expect(service.getRules).toBeCalledWith(user)
			expect(res).toEqual({ cond: 1 })
		})

		it("should return empty object if user can't access this resource", () => {
			// not job of this method to check if user is allowed
			// so we simply do not provide any conditions
			service.getRules = vi.fn().mockImplementation(() => {
				return defineAbility((can) => {
					can("read", "users")
				})
			})
			const res = service.getRuleConditions({ action: "read", resource: "forbidden", user })
			expect(res).toEqual({})
		})

		it("should return empty object if there are no conditions for current rule", () => {
			service.getRules = vi.fn().mockImplementation(() => {
				return defineAbility((can) => {
					can("read", "users")
				})
			})
			const res = service.getRuleConditions({ action: "read", resource: "users", user })
			expect(res).toEqual({})
		})
	})

	/**
	 *
	 */
	describe("injectDynamicValues", () => {
		let permission: Permission

		beforeEach(() => {
			user = AuthUserStub()
			permission = PermissionStub({
				conditions: {
					name: "_$CURRENT_USER",
					numb: { $gte: 10 },
					withHook: "$CURRENT_USER",
					user: { $ne: "$CURRENT_USER" },
					noHook: "CURRENT_USER",
					$and: [{ id: 5 }, { name: "$CURRENT_USER" }],
				},
			})
		})

		it("should only inject relevant value", () => {
			const res = service["injectDynamicValues"]({ permission, user })
			expect(res).toEqual({
				name: "$CURRENT_USER",
				numb: { $gte: 10 }, //
				withHook: user.userId,
				user: { $ne: user.userId },
				noHook: "CURRENT_USER",
				$and: [{ id: 5 }, { name: user.userId }],
			})
		})

		it("should throw if transformer does not exist", () => {
			// better to throw that to user accidentally reveals inner workings
			permission.conditions = { id: "$NON_EXISTING" }
			expect(() => service["injectDynamicValues"]({ permission, user })).toThrow(
				InternalServerErrorException,
			)
		})

		it("should call transformer with modifier", () => {
			vi.useFakeTimers()

			permission.conditions = { createdAt: "$CURRENT_DATE:17d" }

			const res = service["injectDynamicValues"]({ user, permission })
			// we have to check like this, since daylight saving time can cause problem,
			// since ms does not know about it
			const diff = differenceInHours(res["createdAt"] as Date, addDays(new Date(), 17))
			expect(diff).toBeLessThanOrEqual(1)
			expect(res).toEqual({ createdAt: expect.any(Date) })
			// expect(res).toEqual({ createdAt: addDays(new Date(), 17) })

			vi.useRealTimers()
		})
	})

	/**
	 *
	 */
	describe("getAllowedActions", () => {
		beforeEach(() => {
			authzConfig.exposeAllowedPermissions = true
			service.checkSystem = vi.fn(() => true)
		})
		// it("should throw if actions are not exposed", () => {
		// 	authzConfig.exposeAllowedPermissions = false
		// 	expect(() => service.getAllowedActions(user)).toThrow(ForbiddenException)
		// })
		it("should return empty array if not allowed to expose", () => {
			authzConfig.exposeAllowedPermissions = false
			const res = service.getAllowedActions(user)
			expect(res).toEqual([])
		})

		it("should return empty array if current role is not allowed", () => {
			asMock(service.checkSystem).mockReturnValue(false)
			expect(service.getAllowedActions(user)).toEqual([])
		})

		it("should return null if user is admin", () => {
			user.roleId = ADMIN_ROLE_ID
			expect(service.getAllowedActions(user)).toBeNull()
		})

		it("should get allowed actions for user", () => {
			authzState.permissions = [
				PermissionStub({
					roleId: user.roleId,
					action: "read",
					fields: ["f1"],
					resource: "r1",
				}),
				PermissionStub({
					roleId: user.roleId,
					action: "update",
					fields: ["f2"],
					resource: "r2",
				}),
				PermissionStub({ roleId: v4() }),
			]
			//
			const res = service.getAllowedActions(user)
			expect(res).toEqual([
				{ action: "read", fields: ["f1"], resource: "r1" }, //
				{ action: "update", fields: ["f2"], resource: "r2" }, //
			])
		})

		it("should get public actions when not signed in", () => {
			authzState.permissions = [
				PermissionStub({ roleId: PUBLIC_ROLE_ID, action: "read", fields: ["f1"], resource: "r1" }),
				PermissionStub({ roleId: v4() }),
			]

			const res = service.getAllowedActions()
			expect(res).toEqual([
				{ action: "read", fields: ["f1"], resource: "r1" }, //
			])
		})
	})

	/**
	 *
	 */
	describe("getRules", () => {
		//
		it("should allow all actions for admin", () => {
			user.roleId = ADMIN_ROLE_ID
			const rules = service.getRules(user)
			expect(rules.rules).toEqual([{ action: "manage", subject: "all" }])
		})

		it("should return all allowed if authz is disabled", () => {
			service["config"].disable = true
			expect(service.getRules().rules).toEqual([{ action: "manage", subject: "all" }])
		})

		it("clear cache when roles and permissions have been changed", () => {
			const stateCacheVersion = v4()
			authzState.cacheVersion = stateCacheVersion

			service["cache"].version = v4()
			// ensure length of 1+
			service["cache"].values.set("hello", "world" as any)

			service.getRules(user)

			expect(service["cache"].version).toEqual(stateCacheVersion)
			expect(service["cache"].values.keys.length).toEqual(0)
		})

		it("should read data from cache if available", () => {
			const cache = new Map()
			cache.set(user.userId, "fake value")
			service["cache"] = {
				version: authzState.cacheVersion,
				values: cache,
			}
			const res = service.getRules(user)
			expect(res).toEqual("fake value")
		})

		it("should cache data", () => {
			const res = service.getRules(user)
			// test that it points to same object
			expect(service["cache"].values.get(user.userId)).toBe(res)
		})

		it("should get relevant dynamic values ", () => {
			authzState.permissions = [PermissionStub({ roleId: user.roleId })]
			service["injectDynamicValues"] = vi.fn().mockImplementation(() => ({ id: "mock-id" }))

			service.getRules(user)

			expect(service["injectDynamicValues"]).toBeCalledWith({
				permission: authzState.permissions[0],
				user: user,
			})
		})

		it("should inject dynamic values", () => {
			authzState.permissions = [PermissionStub({ roleId: PUBLIC_ROLE_ID })]
			service["injectDynamicValues"] = vi.fn().mockImplementation(() => ({ id: "mock-id" }))

			const rules = service.getRules()

			expect(rules.rules[0]?.conditions).toEqual({ id: "mock-id" })
		})

		describe("get relevant permissions", () => {
			let user: AuthUser

			beforeEach(() => {
				user = AuthUserStub()

				authzState.permissions = times(10, (i) =>
					PermissionStub({
						roleId: i < 5 ? user.roleId : v4(),
						fields: [`f${i}`],
						conditions: { toInject: "$CURRENT_USER" },
						resource: `collections.testTable${i}`,
					}),
				)

				service["injectDynamicValues"] = vi.fn().mockReturnValue({ injected: "values" })
			})

			it("should get rules for current user", () => {
				const res = service.getRules(user)
				expect(res.rules.length).toEqual(5)

				for (let i = 0; i < 5; i++) {
					const rule = res.rules[i]!
					expect(rule).toEqual({
						action: rule.action,
						conditions: { injected: "values" }, //
						fields: ["f" + i],
						subject: "collections.testTable" + i,
					})
				}

				expect.assertions(6)
			})

			it("should get public rules if user is not signed in", () => {
				authzState.permissions = [
					PermissionStub({ roleId: PUBLIC_ROLE_ID }),
					PermissionStub({ roleId: v4() }),
				]
				const res = service.getRules()
				expect(res.rules.length).toEqual(1)
			})

			it("should not add permission if no field is allowed", () => {
				authzState.permissions = [PermissionStub({ roleId: PUBLIC_ROLE_ID, fields: [] })]
				const res = service.getRules()
				expect(res.rules.length).toEqual(0)
			})

			it("should forbid having resource with name 'all' since it's reserved word", async () => {
				authzState.permissions = [
					PermissionStub({
						resource: "all",
						roleId: PUBLIC_ROLE_ID,
						fields: null,
						action: "create",
					}),
				]
				const res = service.getRules()
				expect(res.rules).toEqual([
					{
						action: "create",
						conditions: { injected: "values" },
						subject: "collections.all",
					},
				])
			})
		})
	})

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

				postStub.postInfo = postInfoStub as EntityRef<TPostInfo>

				service.check = vi.fn((v) => {
					if (v.resource === "collections.posts") {
						return v.field === "body" || v.field === "id"
					}
					if (v.resource === "collections.comments") {
						return v.field === "id" || v.field === "body"
					}
					if (v.resource === "collections.postsInfo") {
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
					postStub.comments = comments as EntityRef<TComment>[]
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
