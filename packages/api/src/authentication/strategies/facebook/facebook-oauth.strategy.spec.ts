import { GlobalConfig } from "@api/app/global-app.config"
import { AuthenticationConfig } from "@api/authentication/authentication.config"
import { AuthenticationService } from "@api/authentication/authentication.service"
import { throw500 } from "@api/common/throw-http"
import { buildTestModule } from "@api/testing/build-test-module"
import { ForbiddenException, InternalServerErrorException } from "@nestjs/common"
import { asMock, AuthUser } from "@zmaj-js/common"
import { AuthUserStub } from "@zmaj-js/test-utils"
import { Profile } from "passport-facebook"
import { v4 } from "uuid"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { FacebookOAuthStrategy } from "./facebook-oauth.strategy"

const testSuper = vi.fn()

vi.mock("@nestjs/passport", async () => ({
	...(await vi.importActual<typeof import("@nestjs/passport")>("@nestjs/passport")),
	PassportStrategy: () =>
		class ParentStrategy {
			constructor(params: any) {
				testSuper(params)
			}
		},
}))

describe("FacebookOAuthStrategy", () => {
	const confService = { get: vi.fn() } as any
	const globalConf = new GlobalConfig({ secretKey: v4(), urls: "http://example.com" }, confService)
	const authConf = new AuthenticationConfig(
		{ oauth: { facebook: { clientId: "hello", clientSecret: "world", enabled: true } } },
		globalConf,
		confService,
	)

	afterEach(() => {
		testSuper.mockClear()
	})

	describe("constructor", () => {
		it("should configure strategy properly", () => {
			const authService = {
				oauthSignIn: vi.fn(),
			} as Partial<AuthenticationService> as AuthenticationService
			const strategy = new FacebookOAuthStrategy(authService, authConf, globalConf)
			expect(testSuper).toBeCalledWith({
				callbackURL: `http://example.com/api/auth/oauth/facebook/callback`,
				scope: ["email", "profile"],
				clientID: "hello",
				clientSecret: "world",
			})
		})
	})

	describe("validate", () => {
		let strategy: FacebookOAuthStrategy
		let authnService: AuthenticationService

		let user: AuthUser

		beforeEach(async () => {
			user = AuthUserStub()
			const module = await buildTestModule(FacebookOAuthStrategy, [
				{ provide: AuthenticationConfig, useValue: authConf },
			]).compile()
			strategy = module.get(FacebookOAuthStrategy)
			authnService = module.get(AuthenticationService)

			authnService.oauthSignIn = vi.fn(async () => user)
		})

		it("should call error if email is not provided", async () => {
			const done = vi.fn()
			await strategy.validate("", "", { emails: [] } as Partial<Profile> as any, done)
			expect(done).toBeCalledWith(expect.any(ForbiddenException))
		})

		it("should call error if service throws an error", async () => {
			const done = vi.fn()

			asMock(authnService.oauthSignIn).mockImplementation(async () => throw500(3333))
			await strategy.validate(
				"",
				"",
				{ emails: [{ value: "hello" }] } as Partial<Profile> as any,
				done,
			)
			expect(done).toBeCalledWith(expect.any(InternalServerErrorException))
		})

		it("should call oauth sign in with proper data", async () => {
			const done = vi.fn()
			await strategy.validate(
				"ACCESS_TOKEN",
				"REFRESH_TOKEN",
				{
					emails: [{ value: "my-email@example.com" }],
					name: { givenName: "John", familyName: "Smith" },
				} as Partial<Profile> as any,
				done,
			)
			expect(authnService.oauthSignIn).toBeCalledWith({
				email: "my-email@example.com",
				emailVerified: true,
				firstName: "John",
				lastName: "Smith",
			})
		})

		it("should call done when successful", async () => {
			const done = vi.fn()
			await strategy.validate(
				"",
				"",
				{ emails: [{ value: "hello" }] } as Partial<Profile> as any,
				done,
			)
			expect(done).toBeCalledWith(null, expect.any(AuthUser))
		})
	})
})
