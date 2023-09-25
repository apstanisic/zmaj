import { OrmRepository } from "@zmaj-js/orm"
import { buildTestModule } from "@api/testing/build-test-module"
import { add } from "date-fns"
import { v4 } from "uuid"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { SecurityTokensService } from "./security-tokens.service"

describe("SecurityTokensService", () => {
	const userId = v4()
	let now: Date

	let service: SecurityTokensService
	let repo: OrmRepository

	beforeEach(async () => {
		const module = await buildTestModule(SecurityTokensService).compile()

		service = module.get(SecurityTokensService)
		repo = service["repo"]

		now = new Date()
		vi.useFakeTimers({ now })
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it("should be defined", () => {
		expect(service).toBeInstanceOf(SecurityTokensService)
	})

	describe("createToken", () => {
		beforeEach(() => {
			repo.createOne = vi.fn().mockResolvedValue({ savedToken: true })
		})

		it("should save token in the database", async () => {
			const validUntil = add(new Date(), { months: 1 })
			await service.createToken(
				{
					usedFor: "testing",
					userId,
					data: "test_data",
					validUntil,
				},
				"TRX_1" as any,
			)
			expect(repo.createOne).toBeCalledWith({
				data: expect.objectContaining({
					usedFor: "testing",
					userId,
					data: "test_data",
					validUntil,
				}),
				trx: "TRX_1",
			})
		})

		it("should return saved token", async () => {
			const token = await service.createToken({
				usedFor: "testing",
				userId,
				data: "test_data",
				validUntil: new Date(),
			})
			expect(token).toEqual({ savedToken: true })
		})
	})

	/**
	 *
	 */
	describe("findToken", () => {
		beforeEach(() => {
			repo.findOne = vi.fn().mockResolvedValue({ found1: true })
		})

		it("should find relevant token", async () => {
			await service.findToken({ token: "uuid", usedFor: "password-reset", userId }, "TRX_1" as any)
			expect(repo.findOne).toBeCalledWith({
				trx: "TRX_1",
				where: {
					token: "uuid",
					usedFor: "password-reset",
					userId,
					validUntil: { $gt: now },
				},
			})
		})

		it("should return found token", async () => {
			const token = await service.findToken({ token: "uuid", usedFor: "password-reset", userId })
			expect(token).toEqual({ found1: true })
		})
	})

	/**
	 *
	 */
	describe("deleteAllUserTokens", () => {
		beforeEach(() => {
			repo.deleteWhere = vi.fn()
		})

		it("should delete all user tokens", async () => {
			await service.deleteUserTokens({ userId, trx: "TRX" as any })
			expect(repo.deleteWhere).toBeCalledWith({ trx: "TRX", where: { userId } })
		})
	})

	/**
	 *
	 */
	describe("deleteExpiredToken", () => {
		beforeEach(() => {
			repo.deleteWhere = vi.fn()
		})

		it("should delete expired tokens", async () => {
			await service.deleteExpiredTokens()
			expect(repo.deleteWhere).toBeCalledWith({
				where: {
					validUntil: { $lt: now },
				},
			})
		})
	})
})
