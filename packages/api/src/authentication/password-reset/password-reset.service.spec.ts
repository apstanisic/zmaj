import { AuthorizationService } from "@api/authorization/authorization.service"
import { EmailCallbackService } from "@api/email/email-callback.service"
import { EmailService } from "@api/email/email.service"
import { EncryptionService } from "@api/encryption/encryption.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { UsersService } from "@api/users/users.service"
import { ForbiddenException, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { Email, PasswordResetDto, User, asMock } from "@zmaj-js/common"
import { UserStub } from "@zmaj-js/test-utils"
import { Writable } from "type-fest"
import { v4 } from "uuid"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthenticationConfig } from "../authentication.config"
import { PasswordResetService } from "./password-reset.service"

describe("PasswordResetService", () => {
	let service: PasswordResetService
	let emailService: EmailService
	let usersService: Writable<UsersService>
	let authzService: AuthorizationService
	let authnConfig: AuthenticationConfig
	let emailCallbackService: EmailCallbackService

	let userStub: User

	beforeEach(async () => {
		const module = await buildTestModule(PasswordResetService, [
			{
				provide: JwtService,
				useValue: {
					verifyAsync: async <T>() => ({ jwt: true }) as T,
					signAsync: async () => "jwt_token",
				} satisfies Partial<JwtService>,
			},
			EmailCallbackService,
		]).compile()

		userStub = UserStub({ status: "active" })

		service = module.get(PasswordResetService)

		emailService = module.get(EmailService)
		emailService.sendEmail = vi.fn(async () => {})
		//
		emailCallbackService = module.get(EmailCallbackService)
		//
		authnConfig = module.get(AuthenticationConfig)
		authnConfig.passwordReset = "reset-email"
		//
		usersService = module.get(UsersService)
		usersService.repo = { findOne: vi.fn(async () => userStub) } as any
		//
		authzService = module.get(AuthorizationService)
		authzService.checkSystem = vi.fn(() => true)

		module.get(EncryptionService).createHmac = vi.fn(() => "hmac_value")
		module.get(EncryptionService).verifyHmac = vi.fn(() => true)
	})

	it("should compile", () => {
		expect(service).toBeInstanceOf(PasswordResetService)
	})

	describe("sendPasswordResetEmail", () => {
		let email: Email

		beforeEach(() => {
			email = userStub.email as Email
			emailService.sendEmail = vi.fn()
		})

		it("should throw if action forbidden", async () => {
			authnConfig.passwordReset = "forbidden"
			await expect(service.sendResetPasswordEmail(email)).rejects.toThrow(ForbiddenException)
		})
		// so user don't know if there is account
		it("should do nothing if there is no user", async () => {
			vi.mocked(usersService.repo.findOne).mockResolvedValue(undefined)
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
		})

		it("should send email with token to reset password", async () => {
			await service.sendResetPasswordEmail(email)
			expect(emailService.sendEmail).toBeCalledWith({
				subject: "Reset password",
				to: email,
				text: "Go to http://localhost:5000/api/auth/password-reset/reset?token=jwt_token to reset password",
				html: expect.stringContaining(
					"http://localhost:5000/api/auth/password-reset/reset?token=jwt_token",
				),
			})
		})
	})

	describe("setNewPassword", () => {
		let params: PasswordResetDto

		beforeEach(() => {
			params = new PasswordResetDto({
				password: "password123",
				token: v4(),
			})

			emailCallbackService.verifyJwtCallback = vi.fn(
				async () => ({ sub: userStub.id }) as any,
			)

			usersService.setPassword = vi.fn()
		})

		it("should throw if there is no user", async () => {
			asMock(usersService.repo.findOne).mockResolvedValue(undefined)
			await expect(service.setNewPassword(params)).rejects.toThrow(UnauthorizedException)
		})

		it("should throw if not allowed to change password", async () => {
			asMock(authzService.checkSystem).mockReturnValue(false)
			await expect(service.setNewPassword(params)).rejects.toThrow(ForbiddenException)
		})

		it("should set password", async () => {
			await service.setNewPassword(params)
			expect(usersService.setPassword).toBeCalledWith({
				userId: userStub.id,
				newPassword: params.password,
			})
		})
	})
})
