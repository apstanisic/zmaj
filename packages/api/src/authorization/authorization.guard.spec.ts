import { ExecutionContext, InternalServerErrorException } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { Test } from "@nestjs/testing"
import { asMock } from "@zmaj-js/common"
import { AuthUserStub } from "@zmaj-js/test-utils"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthorizationGuard, AuthzParams } from "./authorization.guard"
import { AuthorizationService } from "./authorization.service"

describe("AuthorizationGuard", () => {
	let guard: AuthorizationGuard
	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				AuthorizationGuard,
				{ provide: Reflector, useValue: { getAllAndOverride: vi.fn() } },
				{
					provide: AuthorizationService,
					useValue: { check: vi.fn().mockReturnValue("is-allowed") },
				},
			],
		}).compile()
		guard = module.get(AuthorizationGuard)
	})
	//

	it("should compile", () => {
		expect(guard).toBeDefined()
	})

	describe("canActivate", () => {
		let context: ExecutionContext
		let params: AuthzParams
		const getRequest = vi.fn().mockReturnValue({ method: "post" })

		beforeEach(() => {
			// jest.clearAllMocks()

			params = { resource: "resource1", action: "read", field: "field1" }
			context = {
				getHandler: vi.fn(),
				getClass: vi.fn(),
				switchToHttp: vi.fn().mockReturnValue({ getRequest }),
			} as any
		})

		it("should return true if no permission is defined", async () => {
			const res = await guard.canActivate(context)
			expect(res).toBe(true)
		})

		it("should return result if there is permission on method", async () => {
			asMock(guard["reflector"].getAllAndOverride)
				.mockReturnValueOnce(params)
				.mockReturnValue(undefined)
			const res = await guard.canActivate(context)
			expect(res).toBe("is-allowed")
		})

		it("should check for relevant permission", async () => {
			asMock(guard["reflector"].getAllAndOverride).mockReturnValueOnce(params)
			await guard.canActivate(context)
			expect(guard["authz"].check).toBeCalledWith({
				action: "read",
				field: "field1",
				resource: "resource1",
			})
		})

		it("should allow to not specify action", async () => {
			asMock(guard["reflector"].getAllAndOverride).mockReturnValueOnce({
				...params,
				action: undefined,
			})
			await guard.canActivate(context)
			expect(guard["authz"].check).toBeCalledWith({
				action: "create",
				field: "field1",
				resource: "resource1",
			})
		})

		it("should check for current user", async () => {
			const user = AuthUserStub()
			asMock(guard["reflector"].getAllAndOverride).mockReturnValue(params)
			getRequest.mockReturnValue({ user })
			await guard.canActivate(context)
			expect(guard["authz"].check).toBeCalledWith(
				expect.objectContaining({
					user,
				}),
			)
		})
	})

	describe("getActionFromHttpMethod", () => {
		it("should get relevant method", () => {
			const get = guard["getActionFromHttpMethod"]("get")
			const post = guard["getActionFromHttpMethod"]("post")
			const put = guard["getActionFromHttpMethod"]("put")
			const patch = guard["getActionFromHttpMethod"]("patch")
			const del = guard["getActionFromHttpMethod"]("delete")

			expect(get).toBe("read")
			expect(post).toBe("create")
			expect(put).toBe("update")
			expect(patch).toBe("update")
			expect(del).toBe("delete")
		})

		it("should throw on unknown", () => {
			expect(() => guard["getActionFromHttpMethod"]("unknown")).toThrow(
				InternalServerErrorException,
			)
		})
	})
})
