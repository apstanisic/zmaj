import { AuthenticationService } from "@api/authentication/authentication.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { BadRequestException, UnauthorizedException } from "@nestjs/common"
import { asMock, throwErr } from "@zmaj-js/common"
import { AuthUserStub } from "@zmaj-js/test-utils"
import { Client, Issuer, Strategy, TokenSet } from "openid-client"
import passport from "passport"
import { beforeEach, describe, expect, it, Mock, vi } from "vitest"
import { OidcConfig } from "./oidc.config"
import { OidcStrategy } from "./oidc.strategy"

vi.mock("passport", () => ({
	default: { use: vi.fn() },
}))

vi.mock("openid-client", () => ({
	Strategy: vi.fn(),
	Issuer: {
		discover: vi.fn(() => {
			class Client {
				constructorParams: unknown[]
				constructor(...params: unknown[]) {
					this.constructorParams = params
				}
			}
			return { Client }
		}),
	},
}))

describe("OidcStrategy", () => {
	let strategy: OidcStrategy
	let oidcConfig: OidcConfig
	let authnService: AuthenticationService

	beforeEach(async () => {
		const module = await buildTestModule(OidcStrategy).compile()
		strategy = module.get(OidcStrategy)
		authnService = module.get(AuthenticationService)
		authnService.oauthSignIn = vi.fn()

		oidcConfig = module.get(OidcConfig)
		oidcConfig.providers = [
			{
				clientId: "id1",
				clientSecret: "sec1",
				issuer: "http://example.com",
				name: "Example",
			},
			{
				clientId: "id2",
				clientSecret: "sec2",
				issuer: "http//domain.test",
				name: "Test",
			},
		]
	})

	describe("clientsAndUrls", () => {
		it("should get clients and urls", async () => {
			await strategy.onModuleInit()
			const res = strategy.clientsAndUrls
			expect(res).toEqual({
				Example: { url: "http://localhost:5000/api/auth/oidc/Example/login" },
				Test: { url: "http://localhost:5000/api/auth/oidc/Test/login" },
			})
		})
	})

	describe("verify", () => {
		let client: Client
		let token: TokenSet
		let done: Mock

		beforeEach(() => {
			done = vi.fn()
			token = { access_token: "hello" } as Partial<TokenSet> as TokenSet
			client = {
				userinfo: vi.fn().mockResolvedValue({
					email: "test@example.com",
					email_verified: false,
					given_name: "First",
					family_name: "Second",
					picture: "some-img",
				}),
			} as Partial<Client> as Client
		})

		it("should call error if access token is not returned", async () => {
			token.access_token = undefined
			await strategy.verify(client, token, done)
			expect(done).toBeCalledWith(expect.any(UnauthorizedException))
		})

		it("should call error if sign in fails", async () => {
			asMock(authnService.oauthSignIn).mockRejectedValue(new BadRequestException())
			await strategy.verify(client, token, done)
			expect(done).toBeCalledWith(expect.any(BadRequestException))
		})

		it("should sign in user", async () => {
			const mockUser = AuthUserStub()
			authnService.oauthSignIn = vi.fn(async () => mockUser)
			await strategy.verify(client, token, done)

			expect(authnService.oauthSignIn).toBeCalledWith({
				email: "test@example.com",
				emailVerified: false,
				firstName: "First",
				lastName: "Second",
				photoUrl: "some-img",
			})
			expect(done).toBeCalledWith(null, mockUser)
		})
	})

	describe("onModuleInit", () => {
		//
		it("should configure passport with clients", async () => {
			const calls: ConstructorParameters<typeof Strategy>[] = []
			asMock(Strategy).mockImplementation((...params: any[]) => {
				calls.push(params as any)
			})
			await strategy.onModuleInit()
			expect(passport.use).nthCalledWith(1, "Example", expect.any(Strategy))
			expect(calls[0]).toEqual([
				{
					client: strategy["clients"]["Example"],
					params: { scope: "openid profile email" },
					usePKCE: true,
				},
				expect.any(Function),
			])

			expect(passport.use).nthCalledWith(2, "Test", expect.any(Strategy))
			expect(calls[1]).toEqual([
				{
					client: strategy["clients"]["Test"],
					params: { scope: "openid profile email" },
					usePKCE: true,
				},
				expect.any(Function),
			])
		})
	})

	describe("getClients", () => {
		it("should init clients", async () => {
			await strategy["initClients"]()
			const clients = strategy["clients"]
			expect(Object.keys(clients)).toHaveLength(2)
			const client1 = clients["Example"]
			const client2 = clients["Test"]
			const client1Params = (client1 as any).constructorParams
			const client2Params = (client2 as any).constructorParams

			expect(strategy["clients"]).toEqual({
				Example: client1,
				Test: client2,
			})

			expect(client1Params).toEqual([
				{
					client_id: "id1",
					client_secret: "sec1",
					redirect_uri: "http://localhost:5000/api/auth/oidc/Example/callback",
				},
			])
			expect(client2Params).toEqual([
				{
					client_id: "id2",
					client_secret: "sec2",
					redirect_uri: "http://localhost:5000/api/auth/oidc/Test/callback",
				},
			])
		})

		it("should handle error for every client individually", async () => {
			asMock(Issuer.discover).mockImplementationOnce(() => throwErr())
			const errorLog = vi.fn()
			strategy["logger"].error = errorLog
			await strategy["initClients"]()
			expect(errorLog).toBeCalledWith(expect.stringContaining("Example"))
			expect(strategy["clients"]).toEqual({
				Test: expect.anything(),
			})
		})
	})
})
