import { EncryptionService } from "@api/encryption/encryption.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { ForbiddenException, UnauthorizedException } from "@nestjs/common"
import { randIp, randUserAgent } from "@ngneat/falso"
import { AuthSession, AuthUser, asMock, uuidRegex } from "@zmaj-js/common"
import { AuthUserStub } from "@zmaj-js/test-utils"
import { addMilliseconds, sub } from "date-fns"
import { v4 } from "uuid"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthenticationConfig } from "../authentication.config"
import { AuthSessionStub } from "./auth-session.stub"
import { AuthSessionsService } from "./auth-sessions.service"

describe("AuthSessionsService", () => {
	let service: AuthSessionsService
	let encryptionService: EncryptionService
	//
	let userStub: AuthUser
	let sessionStub: AuthSession
	let config: AuthenticationConfig

	beforeEach(async () => {
		const module = await buildTestModule(AuthSessionsService).compile()
		// const module: TestingModule = await Test.createTestingModule({
		//   providers: [
		//     AuthSessionsService,
		//     {
		//       provide: EncryptionService,
		//       useValue: {
		//         encrypt: vi.fn((v: string) => "123" + v),
		//         decrypt: vi.fn((v: string) => v.substring(3)),
		//       },
		//     },
		//     mockRepoManager,
		//     {
		//       provide: AuthenticationConfig,
		//       useValue: new AuthenticationConfigMock().setValue("refreshTokenTtl", 1000).build(),
		//     },
		//   ],
		// }).compile()
		service = module.get(AuthSessionsService)
		//
		encryptionService = module.get(EncryptionService)
		encryptionService.encrypt = vi.fn(async (v) => `${v}_123`)
		// remove last 4 chars
		encryptionService.decrypt = vi.fn(async (v) => v.slice(0, -4))
		//
		config = module.get(AuthenticationConfig)
		config.refreshTokenTtlMs = 10_000

		userStub = AuthUserStub()
		sessionStub = AuthSessionStub()
	})

	// afterEach(() => {
	//   jest.clearAllMocks()
	// })

	/**
	 *
	 */
	it("should be defined", () => {
		expect(service).toBeInstanceOf(AuthSessionsService)
	})

	/**
	 *
	 */
	describe("generateRefreshToken", () => {
		it("should generate encrypted refresh token", async () => {
			asMock(encryptionService.encrypt).mockResolvedValue("encrypted")
			const tokens = await service["generateRefreshToken"]()
			expect(tokens.encrypted).toBe("encrypted")
		})

		it("should encrypt random string", async () => {
			const tokens = await service["generateRefreshToken"]()

			expect(encryptionService.encrypt).toBeCalledWith(tokens.raw)
			expect(tokens.encrypted).toEqual(`${tokens.raw}_123`)
		})
	})

	/**
	 *
	 */
	describe("findByRefreshToken", () => {
		beforeEach(() => {
			service.repo.findOne = vi.fn().mockResolvedValue({ token: 1 })
		})

		it("should find session for provided rt", async () => {
			const tokenUuid = v4()
			const res = await service["findByRefreshToken"](`${tokenUuid}_123`)
			expect(service.repo.findOne).toBeCalledWith({ where: { refreshToken: tokenUuid } })
			expect(res).toEqual({ token: 1 })
		})

		it("should throw if not found", async () => {
			service.repo.findOne = vi.fn().mockResolvedValue(undefined)
			await expect(service["findByRefreshToken"]("token_123")).rejects.toThrow(ForbiddenException)
		})
	})

	/**
	 *
	 */
	describe("removeByRefreshToken", () => {
		beforeEach(() => {
			service.repo.deleteById = vi.fn().mockResolvedValue("deleted-item")
			service["findByRefreshToken"] = vi.fn().mockResolvedValue({ id: "found-token" })
		})
		it("should remove user session with refresh token", async () => {
			const res = await service.removeByRefreshToken("token-111")
			expect(service.repo.deleteById).toBeCalledWith({ id: "found-token" })
			expect(res).toEqual("deleted-item")
		})
	})

	/**
	 *
	 */
	describe("removeAllUserSessions", () => {
		beforeEach(() => {
			service.repo.deleteWhere = vi.fn().mockResolvedValue({ deletedItem: true })
		})

		it("should remove user sessions", async () => {
			const res = await service.removeAllUserSessions(userStub.userId)
			expect(service.repo.deleteWhere).toBeCalledWith({ where: { userId: userStub.userId } })
			expect(res).toEqual({ deletedItem: true })
		})
	})

	/**
	 *
	 */
	describe("createSession", () => {
		let params: { ip: string; userAgent?: string }

		beforeEach(() => {
			params = { ip: randIp(), userAgent: randUserAgent() }

			service["generateRefreshToken"] = vi.fn(async () => ({
				encrypted: "hello_123456",
				raw: "world_123456",
			}))
			service.repo.createOne = vi.fn()
		})

		it("should create session in db", async () => {
			await service.createSession(userStub, params)

			expect(service.repo.createOne).toBeCalledWith({
				data: {
					// createdAt: expect.any(Date),
					id: expect.stringMatching(uuidRegex),
					ip: expect.any(String),
					lastUsed: expect.any(Date),
					refreshToken: "world_123456",
					userAgent: expect.any(String),
					userId: expect.stringMatching(uuidRegex),
					validUntil: expect.any(Date),
				},
			})
		})

		it("should return encrypted rt", async () => {
			const res = await service.createSession(userStub, params)
			expect(res).toBe("hello_123456")
		})
	})

	/**
	 *
	 */
	describe("extendSessionValidity", () => {
		beforeEach(() => {
			service.repo.updateById = vi.fn().mockResolvedValue(sessionStub)
			service["findByRefreshToken"] = vi.fn().mockResolvedValue(sessionStub)
		})

		it("should throw if session expired", async () => {
			sessionStub.validUntil = sub(new Date(), { minutes: 1 })
			await expect(service.extendSessionValidity("token")).rejects.toThrow(UnauthorizedException)
		})

		it("should extended session in db", async () => {
			const now = new Date()

			vi.useFakeTimers()
			vi.setSystemTime(now)

			await service.extendSessionValidity("token")

			expect(service.repo.updateById).toBeCalledWith({
				id: sessionStub.id,
				changes: {
					lastUsed: now,
					validUntil: addMilliseconds(now, config.refreshTokenTtlMs),
				},
			})

			vi.useRealTimers()
		})

		it("should return session", async () => {
			const res = await service.extendSessionValidity("enc")
			expect(res).toBe(sessionStub)
		})
	})
})
