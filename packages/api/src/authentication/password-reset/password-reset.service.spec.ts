import { GlobalConfig } from "@api/app/global-app.config"
import { AuthorizationService } from "@api/authorization/authorization.service"
import { EmailService } from "@api/email/email.service"
import { SecurityTokenStub } from "@api/security-tokens/security-token.stub"
import {
	CreateTokenFormEmailConfirmationParams,
	SecurityTokensService,
} from "@api/security-tokens/security-tokens.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { UsersService } from "@api/users/users.service"
import { ForbiddenException, UnauthorizedException } from "@nestjs/common"
import { randFutureDate, randPastDate } from "@ngneat/falso"
import { asMock, Email, PasswordResetDto, SecurityToken, User } from "@zmaj-js/common"
import { UserStub } from "@zmaj-js/test-utils"
import { v4 } from "uuid"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthenticationConfig } from "../authentication.config"
import { PasswordResetService } from "./password-reset.service"

describe("PasswordResetService", () => {
	let service: PasswordResetService
	let emailService: EmailService
	let globalConfig: GlobalConfig
	let usersService: UsersService
	let tokensService: SecurityTokensService
	let authzService: AuthorizationService
	let authnConfig: AuthenticationConfig

	let userStub: User

	beforeEach(async () => {
		const module = await buildTestModule(PasswordResetService).compile()

		userStub = UserStub({ status: "active" })

		service = module.get(PasswordResetService)

		emailService = module.get(EmailService)
		tokensService = module.get(SecurityTokensService)
		//
		globalConfig = module.get(GlobalConfig)
		globalConfig.name = "TestApp"
		globalConfig.joinWithApiUrl = vi.fn((v) => `api_url_${v}`)
		//
		authnConfig = module.get(AuthenticationConfig)
		authnConfig.passwordReset = "reset-email"
		//
		usersService = module.get(UsersService)
		usersService.findActiveUser = vi.fn(async () => userStub)
		//
		authzService = module.get(AuthorizationService)
		authzService.checkSystem = vi.fn(() => true)
	})

	it("should compile", () => {
		expect(service).toBeInstanceOf(PasswordResetService)
	})

	describe("sendPasswordResetEmail", () => {
		let email: Email
		let token: SecurityToken

		beforeEach(() => {
			email = userStub.email as Email
			token = SecurityTokenStub()
			tokensService.deleteUserTokens = vi.fn()
			tokensService.createTokenWithEmailConfirmation = vi.fn(async () => {})
			emailService.sendEmail = vi.fn()
		})

		it("should throw if action forbidden", async () => {
			authnConfig.passwordReset = "forbidden"
			await expect(service.sendResetPasswordEmail(email)).rejects.toThrow(ForbiddenException)
		})
		// so user don't know if there is account
		it("should do nothing if there is no user", async () => {
			asMock(usersService.findActiveUser).mockResolvedValue(undefined)
			await service.sendResetPasswordEmail(email)
			expect(emailService.sendEmail).not.toBeCalled()
		})

		it("should send email explanation if action is forbidden", async () => {
			asMock(authzService.checkSystem).mockReturnValue(false)
			await service.sendResetPasswordEmail(email)
			expect(emailService.sendEmail).toBeCalledWith({
				to: email,
				subject: `Reset password`,
				text: `You can not reset password currently. Please contact us so we can help you.`,
				html: expect.any(String),
			})
			expect(tokensService.createTokenWithEmailConfirmation).not.toBeCalled()
		})

		it("should delete all password reset tokens", async () => {
			await service.sendResetPasswordEmail(email)
			expect(tokensService.createTokenWithEmailConfirmation).toBeCalledWith(
				expect.objectContaining({
					deleteOld: "usedFor",
				}),
			)
		})

		it("should send email with token to reset password", async () => {
			let emailParams: CreateTokenFormEmailConfirmationParams["emailParams"] | undefined
			tokensService.createTokenWithEmailConfirmation = vi.fn(async (p) => {
				emailParams = p.emailParams
			})
			await service.sendResetPasswordEmail(email)
			expect(tokensService.createTokenWithEmailConfirmation).toBeCalledWith<
				[CreateTokenFormEmailConfirmationParams]
			>({
				token: {
					usedFor: "password-reset",
					userId: userStub.id,
					validUntil: expect.any(Date) as any,
				},
				urlQuery: { email },
				deleteOld: "usedFor",
				redirectPath: "/auth/password-reset/reset",
				emailParams: expect.any(Function),
			})
			expect(emailParams).toBeDefined()
			expect(emailParams?.("http://example.com?my-link", "MyApp")).toEqual({
				subject: "Reset password",
				to: email,
				text: "Go to http://example.com?my-link to reset password",
				html: expect.stringContaining("http://example.com?my-link"),
			})
		})

		// it("should create new token", async () => {
		// 	const now = new Date()
		// 	const in3h = addHours(now, 3)
		// 	jest.useFakeTimers()
		// 	jest.setSystemTime(now)
		// 	await service.sendResetPasswordEmail(email)
		// 	expect(tokensService.createTokenWithEmailConfirmation).toBeCalledWith({
		// 		usedFor: "password-reset",
		// 		userId: userStub.id,
		// 		validUntil: in3h,
		// 		data: null,
		// 	})
		// 	jest.useRealTimers()
		// })

		// it("should send email", async () => {
		// 	await service.sendResetPasswordEmail(email)
		// 	expect(emailService.sendEmail).toBeCalledWith({
		// 		to: email,
		// 		subject: expect.stringContaining(globalConfig.name),
		// 		html: expect.stringContaining(
		// 			`auth/password-reset/reset?${qsStringify({ email, token: token.token })}`,
		// 		),
		// 		text: expect.stringContaining(
		// 			`auth/password-reset/reset?${qsStringify({ email, token: token.token })}`,
		// 		),
		// 	})
		// })
	})

	describe("setNewPassword", () => {
		let params: PasswordResetDto

		let tokenStub: SecurityToken

		beforeEach(() => {
			params = new PasswordResetDto({
				email: "email@example.com",
				password: "password123",
				token: v4(),
			})

			tokenStub = SecurityTokenStub({ validUntil: randFutureDate(), userId: userStub.id })

			usersService.setPassword = vi.fn()
			tokensService.findToken = vi.fn().mockResolvedValue(tokenStub)
			tokensService.deleteUserTokens = vi.fn()
		})

		it("should throw if there is no user", async () => {
			asMock(usersService.findActiveUser).mockRejectedValue(new UnauthorizedException())
			await expect(service.setNewPassword(params)).rejects.toThrow(UnauthorizedException)
		})

		it("should throw if not allowed to change password", async () => {
			asMock(authzService.checkSystem).mockReturnValue(false)
			await expect(service.setNewPassword(params)).rejects.toThrow(ForbiddenException)
		})

		it("should get only token for current user and for password reset", async () => {
			await service.setNewPassword(params)
			expect(tokensService.findToken).toBeCalledWith({
				token: params.token,
				userId: userStub.id,
				usedFor: "password-reset",
			})
		})

		it("should throw if token does not exist", async () => {
			asMock(tokensService.findToken).mockResolvedValue(undefined)
			await expect(service.setNewPassword(params)).rejects.toThrow(UnauthorizedException)
		})

		it("should throw if token does is expired", async () => {
			tokenStub.validUntil = randPastDate()
			await expect(service.setNewPassword(params)).rejects.toThrow(UnauthorizedException)
		})

		it("should set password", async () => {
			await service.setNewPassword(params)
			expect(usersService.setPassword).toBeCalledWith({
				userId: userStub.id,
				newPassword: params.password,
			})
		})

		it("should delete all tokens", async () => {
			await service.setNewPassword(params)
			expect(tokensService.deleteUserTokens).toBeCalledWith({ userId: userStub.id })
		})
	})
})
