import { EmailCallbackService } from "@api/email/email-callback.service"
import { EmailService } from "@api/email/email.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { UsersService } from "@api/users/users.service"
import { ForbiddenException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { asMock, PUBLIC_ROLE_ID, SignUpDto, User } from "@zmaj-js/common"
import { UserStub } from "@zmaj-js/test-utils"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthenticationConfig } from "../authentication.config"
import { SignUpService } from "./sign-up.service"

describe.only("SignUpService", () => {
	let service: SignUpService
	let usersService: UsersService
	let authConfig: AuthenticationConfig
	let emailService: EmailService

	beforeEach(async () => {
		const module = await buildTestModule(SignUpService, [
			{
				provide: JwtService,
				useFactory: () =>
					({
						verifyAsync: async <T>() => ({ jwt: true }) as T,
						signAsync: async () => "signed.token.data",
					}) satisfies Partial<JwtService>,
			},
			EmailCallbackService,
		]).compile()

		service = module.get(SignUpService)
		//
		usersService = module.get(UsersService)
		usersService.createUser = vi.fn(async () => UserStub())
		//
		emailService = module.get(EmailService)
		emailService.sendEmail = vi.fn().mockResolvedValue(undefined)
		//
		authConfig = module.get(AuthenticationConfig)
		authConfig.allowSignUp = true
		authConfig.requireEmailConfirmation = true
	})

	it("should compile", () => {
		expect(service).toBeInstanceOf(SignUpService)
	})

	describe("signUp", () => {
		let dto: SignUpDto

		beforeEach(() => {
			dto = new SignUpDto({
				email: "test_example@example.com",
				password: "password",
				firstName: "First",
				lastName: "Last",
			})
		})

		it("should throw if sign up is not allowed", async () => {
			authConfig.allowSignUp = false
			await expect(service.signUp(dto)).rejects.toThrow(ForbiddenException)
		})

		it("should store user in database", async () => {
			const { password, ...rest } = dto
			await service.signUp(dto)
			expect(usersService.createUser).toBeCalledWith({
				data: <User>{
					...rest,
					password,
					roleId: PUBLIC_ROLE_ID,
					status: "emailUnconfirmed",
					confirmedEmail: false,
				},
			})
		})

		it("should allow additional data", async () => {
			await service.signUp(dto, { status: "disabled" })
			expect(usersService.createUser).toBeCalledWith({
				data: expect.objectContaining({ status: "disabled" }),
			})
		})

		it("should send email with token to confirm address", async () => {
			const user = UserStub()
			usersService.createUser = vi.fn(async () => user)
			await service.signUp(dto)

			expect(emailService.sendEmail).toBeCalledWith({
				subject: "Confirm email",
				to: user.email,
				text: "Go to http://localhost:5000/api/auth/sign-up/confirm-email?token=signed.token.data to confirm email",
				html: expect.stringContaining(
					"http://localhost:5000/api/auth/sign-up/confirm-email?token=signed.token.data",
				),
			})
		})

		it("should return stored user", async () => {
			asMock(usersService.createUser).mockResolvedValue({ id: "new_user" })
			const res = await service.signUp({ email: "test@example.com", password: "supertest" })
			expect(res).toEqual({ id: "new_user" })
		})
	})
})
