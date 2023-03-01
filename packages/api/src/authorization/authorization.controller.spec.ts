import { Test } from "@nestjs/testing"
import { asMock, AuthUser } from "@zmaj-js/common"
import { AuthUserStub } from "@zmaj-js/test-utils"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthorizationConfig } from "./authorization.config"
import { AuthorizationController } from "./authorization.controller"
import { AuthorizationService } from "./authorization.service"

describe("AuthorizationController", () => {
	let controller: AuthorizationController
	let service: AuthorizationService
	let user: AuthUser

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			controllers: [AuthorizationController],
			providers: [
				{ provide: AuthorizationService, useValue: {} },
				{
					provide: AuthorizationConfig,
					useValue: new AuthorizationConfig({ exposeAllowedPermissions: true }),
				},
			],
		}).compile()

		controller = module.get(AuthorizationController)
		service = module.get(AuthorizationService)
		user = AuthUserStub()
	})

	describe("getAllowedAction", () => {
		beforeEach(() => {
			service.getAllowedActions = vi.fn().mockReturnValue([55])
		})

		it("should get allowed action", () => {
			const res = controller.getPermittedActions(user)
			expect(res).toEqual({ data: [55] })
		})
		it("should get actions for current user", () => {
			controller.getPermittedActions(user)
			expect(service.getAllowedActions).toBeCalledWith(user)
		})
	})

	describe("isAllowed", () => {
		beforeEach(() => {
			service.checkSystem = vi.fn(() => true)
			service.check = vi.fn(() => true)
		})

		it("should return allowed status", () => {
			const res = controller.isAllowed("read", "test", user)
			expect(res).toEqual({ allowed: true })
			service.check = vi.fn(() => false)
			const res2 = controller.isAllowed("read", "test", user)
			expect(res2).toEqual({ allowed: false })
		})
		it("should check if allowed", () => {
			controller.isAllowed("read", "test", user)
			expect(service.check).toBeCalledWith({ user, action: "read", resource: "test" })
		})

		it("should return allowed false if not exposing this data", () => {
			asMock(service.checkSystem).mockReturnValue(false)
			const res = controller.isAllowed("read", "test", user)
			expect(res).toEqual({ allowed: false })
			expect(service.check).not.toBeCalled()
		})
	})
})
