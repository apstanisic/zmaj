import { RuntimeSettingsService } from "@api/runtime-settings/runtime-settings.service"
import {
	CreateTokenFormEmailConfirmationParams,
	SecurityTokensService,
} from "@api/security-tokens/security-tokens.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { UsersService } from "@api/users/users.service"
import { ForbiddenException } from "@nestjs/common"
import {
	ADMIN_ROLE_ID,
	asMock,
	PUBLIC_ROLE_ID,
	RuntimeSettingsSchema,
	SignUpDto,
	User,
	zodCreate,
} from "@zmaj-js/common"
import { UserStub } from "@zmaj-js/test-utils"
import { v4 } from "uuid"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthenticationConfig } from "../authentication.config"
import { SignUpService } from "./sign-up.service"

describe("SignUpService", () => {
	let service: SignUpService
	let settingsService: RuntimeSettingsService
	let usersService: UsersService
	let authConfig: AuthenticationConfig
	let tokenService: SecurityTokensService

	beforeEach(async () => {
		const module = await buildTestModule(SignUpService).compile()

		service = module.get(SignUpService)
		//
		usersService = module.get(UsersService)
		usersService.createUser = vi.fn(async () => UserStub({ email: "created_user@example.com" }))
		//
		tokenService = module.get(SecurityTokensService)
		tokenService.createTokenWithEmailConfirmation = vi.fn(async () => {})
		//
		settingsService = module.get(RuntimeSettingsService)
		settingsService["getSettingsFromDb"] = vi.fn(async () => ({
			meta: { signUpDynamic: true },
			data: RuntimeSettingsSchema.parse({}),
		}))
		// settingsService.findByKey = vi.fn(async () => undefined)
		//
		authConfig = module.get(AuthenticationConfig)
		authConfig.allowSignUp = true
		authConfig.requireEmailConfirmation = true
	})

	it("should compile", () => {
		expect(service).toBeInstanceOf(SignUpService)
	})

	describe("signUp", () => {
		const defaultRoleId = v4()
		let dto: SignUpDto

		beforeEach(() => {
			dto = new SignUpDto({
				email: "test_example@example.com",
				password: "password",
				firstName: "First",
				lastName: "Last",
			})
			service.isSignUpAllowed = vi.fn().mockResolvedValue(true)
			settingsService.getSettings = vi.fn(() => ({
				meta: { signUpDynamic: true },
				data: { signUpAllowed: true, defaultSignUpRole: defaultRoleId },
			}))
		})

		it("should throw if sign up is not allowed", async () => {
			asMock(service.isSignUpAllowed).mockResolvedValue(false)
			await expect(service.signUp(dto)).rejects.toThrow(ForbiddenException)
		})

		it("should store user in database", async () => {
			const { password, ...rest } = dto
			await service.signUp(dto)
			expect(usersService.createUser).toBeCalledWith({
				data: <User>{
					...rest,
					password,
					roleId: defaultRoleId,
					status: "emailUnconfirmed",
					confirmedEmail: false,
				},
			})
		})

		it("should not allow admin role to be default", () => {
			const res = zodCreate(RuntimeSettingsSchema, { defaultSignUpRole: ADMIN_ROLE_ID })
			expect(res.defaultSignUpRole).toEqual(PUBLIC_ROLE_ID)
		})

		// it("should default to public role when no default role is set", async () => {
		// 	asMock(settingsService.findByKey).mockResolvedValue(undefined)
		// 	await service.signUp(dto)
		// 	expect(usersService.createUser).toBeCalledWith({
		// 		data: expect.objectContaining({
		// 			password: dto.password,
		// 			roleId: PUBLIC_ROLE_ID,
		// 		}),
		// 	})
		// })

		it("should allow additional data", async () => {
			await service.signUp(dto, { status: "disabled" })
			expect(usersService.createUser).toBeCalledWith({
				data: expect.objectContaining({ status: "disabled" }),
			})
		})

		it("should send email with token to confirm address", async () => {
			const user = UserStub()
			usersService.createUser = vi.fn(async () => user)
			let emailParams: CreateTokenFormEmailConfirmationParams["emailParams"] | undefined
			tokenService.createTokenWithEmailConfirmation = vi.fn(async (p) => {
				emailParams = p.emailParams
			})
			await service.signUp(dto)
			expect(tokenService.createTokenWithEmailConfirmation).toBeCalledWith<
				[CreateTokenFormEmailConfirmationParams]
			>({
				token: {
					usedFor: "email-confirm",
					userId: user.id,
					validUntil: expect.any(Date) as any,
				},
				redirectPath: "/auth/sign-up/confirm-email",
				emailParams: expect.any(Function),
			})
			expect(emailParams).toBeDefined()
			expect(emailParams?.("http://example.com?my-link", "MyApp")).toEqual({
				subject: "Confirm email",
				to: user.email,
				text: "Go to http://example.com?my-link to confirm email",
				html: expect.stringContaining("http://example.com?my-link"),
			})
		})

		it("should return stored user", async () => {
			asMock(usersService.createUser).mockResolvedValue({ id: "new_user" })
			const res = await service.signUp({ email: "test@example.com", password: "supertest" })
			expect(res).toEqual({ id: "new_user" })
		})
	})

	/**
	 *
	 */
	describe("isSignUpAllowed", () => {
		it("should return true or false if specified in config", async () => {
			authConfig.allowSignUp = true
			await expect(service.isSignUpAllowed()).resolves.toEqual(true)

			authConfig.allowSignUp = false
			await expect(service.isSignUpAllowed()).resolves.toEqual(false)
		})

		it("should get value from settings otherwise", async () => {
			authConfig.allowSignUp = "dynamic"

			settingsService.getSettings = vi.fn().mockReturnValue({ data: { signUpAllowed: true } })
			const res = await service.isSignUpAllowed()
			expect(res).toEqual(true)

			settingsService.getSettings = vi.fn().mockReturnValue({ data: { signUpAllowed: false } })
			const res2 = await service.isSignUpAllowed()
			expect(res2).toEqual(false)
		})
		// it("should return true if allowed in db", async () => {
		// 	authConfig.allowSignUp = "dynamic"

		// 	asMock(settingsService.findByKey).mockResolvedValue({ value: "true" })
		// 	const res = await service.isSignUpAllowed()
		// 	expect(res).toBe(true)
		// })

		// it("should return false if forbidden in db", async () => {
		// 	authConfig.allowSignUp = "dynamic"

		// 	asMock(settingsService.findByKey).mockResolvedValue({ value: "false" })
		// 	const res = await service.isSignUpAllowed()
		// 	expect(res).toBe(false)
		// })

		// it("should fallback to config if not specified in db", async () => {
		// 	asMock(settingsService.findByKey).mockResolvedValue(undefined)

		// 	authConfig.allowSignUp = "dynamic-default-false"
		// 	await expect(service.isSignUpAllowed()).resolves.toEqual(false)

		// 	authConfig.allowSignUp = "dynamic-default-true"
		// 	await expect(service.isSignUpAllowed()).resolves.toEqual(true)
		// })
	})
})
