import { GlobalConfig } from "@api/app/global-app.config"
import { AuthenticationService } from "@api/authentication/authentication.service"
import { RefreshTokenService } from "@api/authentication/refresh-token.service"
import { EmailService } from "@api/email/email.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { UsersService } from "@api/users/users.service"
import { BadRequestException, UnauthorizedException } from "@nestjs/common"
import { asMock, AuthUser, User } from "@zmaj-js/common"
import { AuthUserStub, UserStub } from "@zmaj-js/test-utils"
import { Response } from "express"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MagicLinkService } from "./magic-link.service"

vi.mock("@zmaj-js/common", async () => ({
	...(await vi.importActual<typeof import("@zmaj-js/common")>("@zmaj-js/common")),
	minFnDuration: vi.fn(async (_, fn) => fn()),
}))

describe("MagicLinkService", () => {
	let service: MagicLinkService

	let globalConfig: GlobalConfig
	let emailService: EmailService
	let usersService: UsersService
	// let authzService: AuthorizationService
	let refreshTokenService: RefreshTokenService
	let authnService: AuthenticationService

	beforeEach(async () => {
		// jest.clearAllMocks()

		const module = await buildTestModule(MagicLinkService).compile()

		service = module.get(MagicLinkService)

		globalConfig = module.get(GlobalConfig)
		emailService = module.get(EmailService)
		usersService = module.get(UsersService)
		// authzService = module.get(AuthorizationService)
		refreshTokenService = module.get(RefreshTokenService)
		authnService = module.get(AuthenticationService)
	})

	it("should be defined", () => {
		expect(service).toBeInstanceOf(MagicLinkService)
	})

	/**
	 *
	 */
	describe("sendMagicLink", () => {
		let user: User

		beforeEach(() => {
			user = UserStub({ status: "active" })

			emailService.sendEmail = vi.fn()
			usersService.findUser = vi.fn(async (emailOrId) => user)
			// authzService.checkSystem = vi.fn().mockReturnValue(true)
			globalConfig.joinWithApiUrl = vi.fn((val: string) => `api_url/${val}`)
		})

		it("should throw if value is not email", async () => {
			await expect(service.sendMagicLink("non-email", "href")).rejects.toThrow(BadRequestException)
		})

		it("should send email to user without account telling them that sign in attempted, but no account", async () => {
			asMock(usersService.findUser).mockResolvedValue(undefined)
			await service.sendMagicLink("email@example.com", "href")
			expect(emailService.sendEmail).toBeCalledWith({
				to: "email@example.com",
				subject: "Sign-in link",
				html: expect.not.stringContaining("api_url/url-path"),
				text: "You tried to sign in, but you do not have account with us",
			})
		})

		it("should send email to user with non active account that they can't sign in ", async () => {
			user.status = "disabled"
			await service.sendMagicLink(user.email, "href")
			expect(emailService.sendEmail).toBeCalledWith({
				to: user.email,
				subject: "Sign-in link",
				html: expect.not.stringContaining("api_url/url-path"),
				text: "You are not allowed to sign in.",
			})
		})

		it("should send email", async () => {
			await service.sendMagicLink(user.email, "url-path")
			expect(emailService.sendEmail).toBeCalledWith({
				to: user.email,
				subject: "Sign-in link",
				html: expect.stringContaining("api_url/url-path"),
				text: expect.stringContaining("api_url/url-path"),
			})
		})
	})

	/**
	 *
	 */
	describe("verify", () => {
		let user: User
		const done = vi.fn()
		//
		beforeEach(() => {
			user = UserStub({ status: "active" })
			usersService.findActiveUser = vi.fn().mockResolvedValue(user)
		})

		it("should throw if user not found", async () => {
			asMock(usersService.findActiveUser).mockRejectedValue(new UnauthorizedException(123))
			await service.verify({ destination: "test@example.com" }, done)
			expect(done).toBeCalledWith(expect.any(UnauthorizedException))
		})

		it("should sign user in", async () => {
			await service.verify({ destination: "test@example.com" }, done)
			expect(done).toBeCalledWith(undefined, expect.objectContaining(AuthUser.fromUser(user)))
		})
	})

	/**
	 *
	 */
	describe("signIn", () => {
		let res: Response
		let user: AuthUser

		beforeEach(() => {
			res = { res: "res" } as any
			user = AuthUserStub()
			authnService.signInWithoutPassword = vi.fn().mockResolvedValue({ refreshToken: "rt" })
			refreshTokenService.set = vi.fn()
		})

		it("should create session and tokens", async () => {
			await service.signIn(res, user, { ip: "10.0.0.0", userAgent: "ua" })
			expect(authnService.signInWithoutPassword).toBeCalledWith(user, {
				ip: "10.0.0.0",
				userAgent: "ua",
			})
		})

		it("should set refresh token as cookie", async () => {
			await service.signIn(res, user, { ip: "10.0.0.0", userAgent: "ua" })
			expect(refreshTokenService.set).toBeCalledWith(res, "rt")
		})
	})
})
