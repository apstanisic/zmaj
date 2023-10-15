import { GlobalConfig } from "@api/app/global-app.config"
import { AuthorizationService } from "@api/authorization/authorization.service"
import { EmailCallbackService } from "@api/email/email-callback.service"
import { EmailService } from "@api/email/email.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { UsersService } from "@api/users/users.service"
import { BadRequestException, ForbiddenException, UnauthorizedException } from "@nestjs/common"
import { randPassword } from "@ngneat/falso"
import { AuthUser, ChangeEmailDto, User, asMock, joinUrl } from "@zmaj-js/common"
import { UserStub } from "@zmaj-js/test-utils"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EmailChangeService } from "./email-change.service"

describe("EmailChangeService", () => {
	let service: EmailChangeService
	let authzService: AuthorizationService
	let usersService: UsersService
	let globalConfig: GlobalConfig
	let emailCallbackService: EmailCallbackService
	let emailService: EmailService
	//
	let fullUser: User
	let userStub: AuthUser
	//
	beforeEach(async () => {
		const module = await buildTestModule(EmailChangeService).compile()
		//
		fullUser = UserStub({ status: "active" })
		userStub = AuthUser.fromUser(fullUser)
		//
		service = module.get(EmailChangeService)
		//
		emailService = module.get(EmailService)
		emailService.sendEmail = vi.fn()

		emailCallbackService = module.get(EmailCallbackService)
		emailCallbackService.createJwtCallbackUrl = vi.fn(
			async () => new URL("http://example.com/test?token=test"),
		)
		//
		authzService = module.get(AuthorizationService)
		authzService.checkSystem = vi.fn(() => true)
		//
		usersService = module.get(UsersService)
		usersService.updateUser = vi.fn()
		usersService.findActiveUser = vi.fn(async () => fullUser)
		usersService.checkPassword = vi.fn(async () => true)

		//
		globalConfig = module.get(GlobalConfig)
		globalConfig.secretKey = "hello_world_secret_key_12345"
		globalConfig.joinWithApiUrl = vi.fn((v) => joinUrl(`/test/api/`, v))
	})

	it("should compile", () => {
		expect(service).toBeInstanceOf(EmailChangeService)
	})

	describe("requestEmailChange", () => {
		let dto: ChangeEmailDto

		beforeEach(() => {
			dto = new ChangeEmailDto({
				newEmail: "hello_world@example.com",
				password: randPassword({ size: 12 }),
			})
		})

		it("should throw if user is not allowed to change email", async () => {
			asMock(authzService.checkSystem).mockImplementation(() => false)
			await expect(service.requestEmailChange(userStub, dto)).rejects.toThrow(
				ForbiddenException,
			)
		})

		it("should throw if password is incorrect", async () => {
			asMock(usersService.checkPassword).mockImplementation(async () => false)
			await expect(service.requestEmailChange(userStub, dto)).rejects.toThrow(
				BadRequestException,
			)
		})

		it("should create proper jwt", async () => {
			await service.requestEmailChange(userStub, dto)
			expect(emailCallbackService.createJwtCallbackUrl).toBeCalledWith({
				data: {
					current: userStub.email,
					next: "hello_world@example.com",
				},
				expiresIn: "6h",
				path: "/auth/account/email-change/confirm",
				usedFor: "email-change",
				userId: userStub.userId,
			})
		})

		it("should send email with token to confirm changed email", async () => {
			await service.requestEmailChange(userStub, dto)
			expect(emailService.sendEmail).toBeCalledWith({
				subject: "Confirm email change",
				to: dto.newEmail,
				text: "Go to http://example.com/test?token=test to confirm email change",
				html: expect.stringContaining("http://example.com/test?token=test"),
			})
		})
	})

	describe("setNewEmail", () => {
		let token: string

		beforeEach(() => {
			emailCallbackService.verifyJwtCallback = vi.fn(async () => ({
				sub: userStub.userId,
				type: "email-change",
				current: userStub.email,
				next: "next@example.com",
			}))
		})

		it("should throw if user is not allowed to change email", async () => {
			asMock(authzService.checkSystem).mockImplementation(() => false)
			await expect(service.setNewEmail({ token })).rejects.toThrow(ForbiddenException)
		})

		it("should throw if token does not exists", async () => {
			emailCallbackService.verifyJwtCallback = vi
				.fn()
				.mockRejectedValue(new UnauthorizedException())
			await expect(service.setNewEmail({ token })).rejects.toThrow(UnauthorizedException)
		})

		it("should change user email in db", async () => {
			await service.setNewEmail({ token })
			expect(usersService.updateUser).toBeCalledWith({
				userId: userStub.userId,
				data: { email: "next@example.com" },
			})
		})
	})
})
