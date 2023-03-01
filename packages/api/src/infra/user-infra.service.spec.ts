import { AuthorizationService } from "@api/index"
import { buildTestModule } from "@api/testing/build-test-module"
import { ForbiddenException } from "@nestjs/common"
import { asMock, AuthUser } from "@zmaj-js/common"
import { AuthUserStub } from "@zmaj-js/test-utils"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { InfraStateService } from "./infra-state/infra-state.service"
import { UserInfraService } from "./user-infra.service"

// jest.mock("immer", () => ({
// 	produce: vi.fn((data: any, fn: (data: any) => void) => {
// 		const toMutate = cloneDeep(data)
// 		fn(toMutate)
// 		return toMutate
// 	}),
// }))

describe("InfraService", () => {
	let service: UserInfraService
	let authzS: AuthorizationService
	let state: InfraStateService
	let user: AuthUser

	beforeEach(async () => {
		const module = await buildTestModule(UserInfraService).compile()
		service = module.get(UserInfraService)
		state = module.get(InfraStateService)
		authzS = module.get(AuthorizationService)
		authzS.checkSystem = vi.fn(() => true)

		user = AuthUserStub({ email: "user@example.com" })
	})

	describe("getInfra", () => {
		it("should throw if user can not read infra", () => {
			asMock(authzS.checkSystem).mockReturnValue(false)
			expect(() => service.getInfra(user)).toThrow(ForbiddenException)
		})
		it("should return infra", () => {
			const infra = service.getInfra(user)
			expect(infra).toEqual(Object.values(state.collections))
			//
		})
	})

	// describe("getCacheKey", () => {
	//   beforeEach(() => {
	//     state.version = "stateVersion"
	//   })
	//   it("should have cache tied to state version and user id", () => {
	//     user.userId = "userId"
	//     const key = service["getCacheKey"](user)
	//     expect(key).toEqual("SYSTEM_INFRA__stateVersion__userId")
	//   })

	//   it("should fallback to public role id if user is not logged in", () => {
	//     const key = service["getCacheKey"]()
	//     expect(key).toEqual(`SYSTEM_INFRA__stateVersion__${PUBLIC_ROLE_ID}`)
	//   })
	// })

	// describe("setCache", () => {
	//   const set = vi.fn()
	//   beforeEach(() => {
	//     jest.clearAllMocks()
	//     service["cacheManager"].set = set
	//     service["getCacheKey"] = vi.fn((u) => u?.email ?? "")
	//   })
	//   it("should set cache properly", async () => {
	//     await service["setCache"]("hello world" as any, user)
	//     expect(set).toBeCalledWith("user@example.com", "hello world", { ttl: 600 })
	//   })
	// })

	// describe("getFromCache", () => {
	//   const get = vi.fn().mockResolvedValue("1234")
	//   beforeEach(() => {
	//     jest.clearAllMocks()
	//     service["cacheManager"].get = get
	//     service["getCacheKey"] = vi.fn((u) => u?.email ?? "")
	//   })
	//   it("should get cache properly", async () => {
	//     const res = await service["getFromCache"](user)
	//     expect(get).toBeCalledWith("user@example.com")
	//     expect(res).toEqual("1234")
	//   })
	// })

	// describe("getInfra", () => {
	//   beforeEach(() => {
	//     service["getFromCache"] = vi.fn()
	//     service["setCache"] = vi.fn()
	//     service["getFreshAllowedInfra"] = vi.fn().mockReturnValue("qwe")
	//   })

	//   it("should return cached value if exist", async () => {
	//     asMock(service["getFromCache"]).mockResolvedValue("1234")
	//     const res = await service.getInfra(user)
	//     expect(res).toEqual("1234")
	//   })

	//   it("should return fresh result if there is no cache", async () => {
	//     const res = await service.getInfra(user)
	//     expect(res).toEqual("qwe")
	//   })

	//   it("should set cache if there is no currently ", async () => {
	//     await service.getInfra(user)
	//     expect(service["setCache"]).toBeCalledWith("qwe", user)
	//   })
	// })

	// describe("getFreshInfra", () => {
	//   beforeEach(() => {
	//     service["authz"].getRules = vi.fn().mockReturnValue(
	//       defineAbility((can) => {
	//         can("read", "posts", ["id", "title", "comments"])
	//       }),
	//     )
	//   })
	//   it("should return only allowed collection", () => {
	//     service["authz"].getRules = vi.fn().mockReturnValue(
	//       defineAbility((can) => {
	//         can("read", "posts")
	//         can("read", "comments")
	//       }),
	//     )

	//     const res = service["getFreshAllowedInfra"](user)
	//     expect(res).toHaveLength(2)
	//   })

	//   it("should return only allowed fields", () => {
	//     const res = service["getFreshAllowedInfra"](user)

	//     const everyFieldValid = res[0]?.fields.every((f) => ["id", "title"].includes(f.columnName))
	//     const everyFullFieldValid = res[0]?.fullFields.every((f) =>
	//       ["id", "title"].includes(f.columnName),
	//     )

	//     expect(everyFieldValid).toBeTrue()
	//     expect(everyFullFieldValid).toBeTrue()
	//     expect(res[0]?.fields).toHaveLength(2)
	//     expect(res[0]?.fullFields).toHaveLength(2)
	//   })

	//   it("should return only allowed relations", () => {
	//     const res = service["getFreshAllowedInfra"](user)

	//     const everyRelValid = res[0]?.relations.every((f) => ["comments"].includes(f.propertyName))
	//     const everyFullRelValid = res[0]?.fullRelations.every((f) =>
	//       ["comments"].includes(f.propertyName),
	//     )

	//     expect(everyRelValid).toBeTrue()
	//     expect(everyFullRelValid).toBeTrue()
	//     expect(res[0]?.relations).toHaveLength(1)
	//     expect(res[0]?.fullRelations).toHaveLength(1)
	//   })

	//   it("should only leave allowed properties", () => {
	//     const res = service["getFreshAllowedInfra"](user)

	//     const properties = Object.keys(res[0]!.properties).sort()
	//     expect(properties).toEqual(["comments", "id", "title"])
	//   })
	// })
})
