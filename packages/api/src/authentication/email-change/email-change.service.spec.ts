import { GlobalConfig } from "@api/app/global-app.config"
import { AuthorizationService } from "@api/authorization/authorization.service"
import { SecurityTokenStub } from "@api/security-tokens/security-token.stub"
import {
	CreateTokenFormEmailConfirmationParams,
	SecurityTokensService,
} from "@api/security-tokens/security-tokens.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { UsersService } from "@api/users/users.service"
import { BadRequestException, ForbiddenException, UnauthorizedException } from "@nestjs/common"
import { randPassword } from "@ngneat/falso"
import {
	asMock,
	AuthUser,
	ChangeEmailDto,
	joinUrl,
	SecurityToken,
	User,
	type UUID,
} from "@zmaj-js/common"
import { UserStub } from "@zmaj-js/test-utils"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EmailChangeService } from "./email-change.service"

describe("EmailChangeService", () => {
	let service: EmailChangeService
	// let emailService: EmailService
	let authzService: AuthorizationService
	let usersService: UsersService
	let tokensService: SecurityTokensService
	let globalConfig: GlobalConfig
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
		// emailService = module.get(EmailService)
		// emailService.sendEmail = vi.fn()
		//
		authzService = module.get(AuthorizationService)
		authzService.checkSystem = vi.fn(() => true)
		//
		usersService = module.get(UsersService)
		usersService.updateUser = vi.fn()
		usersService.findActiveUser = vi.fn(async () => fullUser)
		usersService.checkPassword = vi.fn(async () => true)
		//
		tokensService = module.get(SecurityTokensService)
		tokensService.createTokenWithEmailConfirmation = vi.fn(async () => {})
		tokensService.deleteUserTokens = vi.fn(async () => undefined)

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
			await expect(service.requestEmailChange(userStub, dto)).rejects.toThrow(ForbiddenException)
		})

		it("should throw if password is incorrect", async () => {
			asMock(usersService.checkPassword).mockImplementation(async () => false)
			await expect(service.requestEmailChange(userStub, dto)).rejects.toThrow(BadRequestException)
		})

		it("should send email with token to confirm changed email", async () => {
			let emailParams: CreateTokenFormEmailConfirmationParams["emailParams"] | undefined
			tokensService.createTokenWithEmailConfirmation = vi.fn(async (p) => {
				emailParams = p.emailParams
			})
			await service.requestEmailChange(userStub, dto)
			expect(tokensService.createTokenWithEmailConfirmation).toBeCalledWith<
				[CreateTokenFormEmailConfirmationParams]
			>({
				token: {
					usedFor: "email-change",
					userId: userStub.userId,
					validUntil: expect.any(Date) as any,
					data: dto.newEmail,
				},
				urlQuery: { userId: userStub.userId },
				redirectPath: "/auth/account/email-change/confirm",
				emailParams: expect.any(Function),
			})
			expect(emailParams).toBeDefined()
			expect(emailParams?.("http://example.com?my-link", "MyApp")).toEqual({
				subject: "Confirm email change",
				to: dto.newEmail,
				text: "Go to http://example.com?my-link to confirm email change",
				html: expect.stringContaining("http://example.com?my-link"),
			})
		})

		// it("should store token in database", async () => {
		// 	const now = new Date()

		// 	jest.useFakeTimers()
		// 	jest.setSystemTime(now)

		// 	await service.requestEmailChange(userStub, dto)

		// 	expect(tokensService.createTokenWithEmailConfirmation).toBeCalledWith({
		// 		userId: userStub.userId,
		// 		usedFor: "email-change",
		// 		validUntil: addHours(now, 3),
		// 		data: "hello_world@example.com",
		// 	})

		// 	jest.useRealTimers()
		// })

		// it("should send email with instructions", async () => {
		// 	await service.requestEmailChange(userStub, dto)
		// 	expect(1).toBe(2)
		// 	// expect(emailService.sendEmail).toBeCalledWith({
		// 	// 	text: expect.stringContaining(
		// 	// 		`/test/api/auth/account/email-change/confirm?userId=${userStub.userId}&token=mock_token`,
		// 	// 	),
		// 	// 	to: "hello_world@example.com",
		// 	// })
		// 	//
		// })
	})

	describe("setNewEmail", () => {
		let tokenStub: SecurityToken
		let token: string
		let userId: UUID

		beforeEach(() => {
			tokenStub = SecurityTokenStub({ data: "hello_world@example.com", usedFor: "email-change" })

			userId = userStub.userId as UUID
			token = tokenStub.token

			tokensService.findToken = vi.fn().mockResolvedValue(tokenStub)
		})

		it("should throw if user is not allowed to change email", async () => {
			asMock(authzService.checkSystem).mockImplementation(() => false)
			await expect(service.setNewEmail({ token, userId })).rejects.toThrow(ForbiddenException)
		})

		it("should throw if token does not exists", async () => {
			asMock(tokensService.findToken).mockResolvedValue(undefined)
			await expect(service.setNewEmail({ userId, token })).rejects.toThrow(UnauthorizedException)
		})

		it("should change user email in db", async () => {
			await service.setNewEmail({ userId, token })
			expect(usersService.updateUser).toBeCalledWith({
				userId: userStub.userId,
				data: { email: "hello_world@example.com" },
			})
		})

		it("should delete all user tokens", async () => {
			await service.setNewEmail({ userId, token })
			expect(tokensService.deleteUserTokens).toBeCalled()
		})
	})
})
