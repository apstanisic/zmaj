import { buildTestModule } from "@api/testing/build-test-module"
import { randFutureDate } from "@ngneat/falso"
import { REFRESH_COOKIE_NAME } from "@zmaj-js/common"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AuthenticationConfig } from "./authentication.config"
import { RefreshTokenService } from "./refresh-token.service"

describe("RefreshTokenService", () => {
	let service: RefreshTokenService
	let authnConfig: AuthenticationConfig

	beforeEach(async () => {
		const module = await buildTestModule(RefreshTokenService).compile()

		service = module.get(RefreshTokenService)
		//
		authnConfig = module.get(AuthenticationConfig)
		authnConfig.refreshTokenTtlMs = 100_000
	})

	it("should compile", () => {
		expect(service).toBeInstanceOf(RefreshTokenService)
	})

	describe("removeRefreshToken", () => {
		it("should remove refresh token", () => {
			const clearCookie = vi.fn()
			const response = { clearCookie } as any
			service.remove(response)
			expect(clearCookie).toBeCalledWith(REFRESH_COOKIE_NAME)
		})
	})

	describe("set", () => {
		it("should set refresh token that expires at correct time", () => {
			const cookie = vi.fn()
			const response = { cookie } as any

			const expirationDate = randFutureDate()

			service["getExpirationDate"] = vi.fn(() => expirationDate)

			service.set(response, "refresh-token-123")

			expect(cookie).toBeCalledWith(REFRESH_COOKIE_NAME, "refresh-token-123", {
				httpOnly: true,
				sameSite: "lax",
				expires: expirationDate,
				signed: true,
				secure: true,
			})
		})
	})

	describe("getExpirationDate", () => {
		let date: Date

		beforeEach(() => {
			date = new Date(5000)
			vi.useFakeTimers({ now: date })
		})

		afterEach(() => {
			vi.useRealTimers()
		})

		it("should return proper expiration date", () => {
			authnConfig.refreshTokenTtlMs = 1500
			const res = service["getExpirationDate"]()
			expect(res.getTime()).toEqual(6500)
		})
	})
})
