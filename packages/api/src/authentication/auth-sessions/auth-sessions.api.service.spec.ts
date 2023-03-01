import { AuthorizationService } from "@api/authorization/authorization.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { ForbiddenException, NotFoundException } from "@nestjs/common"
import { asMock, AuthUser, GetManyOptions, Struct, UUID } from "@zmaj-js/common"
import { AuthUserStub, ReadUrlQueryStub } from "@zmaj-js/test-utils"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthSessionsApiService } from "./auth-sessions.api.service"
import { UserAgentService } from "./user-agent.service"

describe("AuthSessionsApiService", () => {
	let service: AuthSessionsApiService
	let authzService: AuthorizationService
	let userAgentService: UserAgentService
	//
	let user: AuthUser

	beforeEach(async () => {
		const module = await buildTestModule(AuthSessionsApiService, [
			{ provide: UserAgentService, useValue: new UserAgentService() },
		]).compile()

		service = module.get(AuthSessionsApiService)
		//
		authzService = module.get(AuthorizationService)
		authzService.checkSystem = vi.fn(() => true)
		//
		userAgentService = module.get(UserAgentService)

		user = AuthUserStub()
	})

	describe("getUserSessions", () => {
		let options: GetManyOptions

		beforeEach(() => {
			options = ReadUrlQueryStub()
			service.repo.findAndCount = vi.fn().mockResolvedValue([[{ id: 1 }, { id: 2 }], 2])
			userAgentService.expandPublicSession = vi
				.fn()
				.mockImplementation((val: Struct) => ({ ...val, expanded: true }))
		})

		it("should throw if forbidden", async () => {
			asMock(authzService.checkSystem).mockReturnValue(false)
			await expect(service.getUserSessions(user, options)).rejects.toThrow(ForbiddenException)
		})

		it("should return relevant sessions", async () => {
			options.limit = 10
			options.page = 3
			options.sort = {}
			await service.getUserSessions(user, options)
			expect(service.repo.findAndCount).toBeCalledWith({
				where: { userId: user.userId },
				limit: 10,
				offset: 20,
				orderBy: { createdAt: "DESC" },
				fields: {
					createdAt: true,
					id: true,
					lastUsed: true,
					userAgent: true,
					ip: true,
					userId: true,
				},
			})
			//
		})

		it("should returned expanded sessions", async () => {
			const res = await service.getUserSessions(user, options)
			expect(res).toEqual({
				count: 2,
				data: [
					{ id: 1, expanded: true },
					{ id: 2, expanded: true },
				],
			})
		})
		//
	})

	describe("findById", () => {
		const id = "some-id" as UUID
		//
		beforeEach(() => {
			service.repo.findOne = vi.fn().mockResolvedValue({ id: 1 })
			userAgentService.expandPublicSession = vi
				.fn()
				.mockImplementation((v: Struct) => ({ ...v, expandedSession: true }))
		})

		it("should throw if forbidden", async () => {
			asMock(authzService.checkSystem).mockReturnValue(false)
			await expect(service.findById(id, user)).rejects.toThrow(ForbiddenException)
		})

		it("should get relevant session", async () => {
			await service.findById(id, user)
			expect(service.repo.findOne).toBeCalledWith({
				where: { id: id, userId: user.userId },
				fields: {
					createdAt: true,
					id: true,
					ip: true,
					lastUsed: true,
					userAgent: true,
					userId: true,
				},
			})
		})

		it("should throw if no session is found", async () => {
			asMock(service.repo.findOne).mockResolvedValue(undefined)
			await expect(service.findById(id, user)).rejects.toThrow(NotFoundException)
		})

		it("should return expanded session", async () => {
			const res = await service.findById(id, user)
			expect(res).toEqual({ id: 1, expandedSession: true })
		})
	})

	/**
	 *
	 */
	describe("removeById", () => {
		const id = "some-uuid" as UUID

		beforeEach(() => {
			service.repo.deleteWhere = vi.fn().mockResolvedValue([{ id: 1 }])
			userAgentService.expandPublicSession = vi
				.fn()
				.mockImplementation((v: Struct) => ({ ...v, expandedSession: true }))
		})

		it("should throw if forbidden", async () => {
			asMock(authzService.checkSystem).mockReturnValue(false)
			await expect(service.removeById(id, user)).rejects.toThrow(ForbiddenException)
		})

		it("should delete relevant session", async () => {
			await service.removeById(id, user)
			expect(service.repo.deleteWhere).toBeCalledWith({
				where: { id, userId: user.userId },
			})
		})

		it("should throw if no session is deleted", async () => {
			asMock(service.repo.deleteWhere).mockResolvedValue([])
			await expect(service.removeById(id, user)).rejects.toThrow(NotFoundException)
		})

		it("should return deleted session", async () => {
			const res = await service.removeById(id, user)
			expect(res).toEqual({ id: 1, expandedSession: true })
		})
	})
})
