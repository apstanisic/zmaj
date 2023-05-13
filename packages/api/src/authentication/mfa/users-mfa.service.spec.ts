import { buildTestModule } from "@api/testing/build-test-module"
import { UsersService } from "@api/users/users.service"
import { BadRequestException, ForbiddenException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { TestingModule } from "@nestjs/testing"
import { asMock, AuthUser, makeWritable, SignInDto, User, UserWithSecret } from "@zmaj-js/common"
import { AuthUserStub, UserStub } from "@zmaj-js/test-utils"
import { SetRequired } from "type-fest"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MfaService } from "./mfa.service"
import { UsersMfaService } from "./users-mfa.service"

describe("UsersMfaService", () => {
	let module: TestingModule
	let service: UsersMfaService
	let usersService: UsersService

	let fullUser: User

	beforeEach(async () => {
		module = await buildTestModule(UsersMfaService).compile()

		fullUser = UserStub()

		service = module.get(UsersMfaService)
		//
		usersService = module.get(UsersService)
		makeWritable(usersService).repo ??= {} as any
		usersService.tryChangePassword = vi.fn()
		usersService.updateUser = vi.fn().mockImplementation(async () => fullUser)
		usersService.findActiveUser = vi.fn(async () => fullUser)
	})

	it("should compile", () => {
		expect(service).toBeInstanceOf(UsersMfaService)
	})

	describe("requestToEnableOtp", () => {
		let user: AuthUser
		let dbUser: SetRequired<User, "password" | "otpToken">

		let usersService: UsersService
		let mfaService: MfaService
		let jwtService: JwtService
		beforeEach(() => {
			user = AuthUserStub({ email: "hello@example.com" })
			dbUser = UserStub({ email: "hello@example.com", status: "active", otpToken: null })
			//
			usersService = module.get(UsersService)
			makeWritable(usersService).repo ??= {} as any
			usersService.findActiveUser = vi.fn(async () => dbUser)
			usersService.findUserWithHiddenFields = vi.fn(async () => dbUser)
			usersService.ensureUserIsActive = vi.fn()
			mfaService = module.get(MfaService)
			mfaService["generateSecret"] = vi.fn(() => "secret_123")
			mfaService["generateQrCode"] = vi.fn(async (name, secret) => `qrcode_${name}_${secret}`)
			mfaService.calculateBackupCodes = vi.fn(async (secret) => secret.split("_"))
			jwtService = module.get(JwtService)
			jwtService.signAsync = vi.fn(async (v) => JSON.stringify(v))

			mfaService.generateParamsToEnable = vi.fn(async (email) => ({
				image: "img",
				jwt: `jwt_${email}`,
				backupCodes: ["1"],
				secret: "secret",
			}))
		})

		it("should throw if user is not active", async () => {
			dbUser.status = "banned"
			await expect(service.requestToEnableOtp(user.userId)).rejects.toThrow(ForbiddenException)
		})

		it("should throw if user already has 2fa enabled", async () => {
			dbUser.otpToken = "1234512345"
			await expect(service.requestToEnableOtp(user.userId)).rejects.toThrow(ForbiddenException)
		})

		it("should return data needed to enable mfa", async () => {
			const result = await service.requestToEnableOtp(user.email)
			expect(result).toEqual({
				image: "img",
				jwt: `jwt_${user.email}`,
				backupCodes: ["1"],
				secret: "secret",
				//
			})
		})
	})

	describe("disableOtp", () => {
		beforeEach(() => {
			usersService.checkPassword = vi.fn(async () => true)
			usersService.repo.updateById = vi.fn()
		})
		it("should check password", async () => {
			asMock(usersService.checkPassword).mockResolvedValue(false)
			await expect(service.disableOtp(AuthUserStub(), "hello_world")).rejects.toThrow(
				BadRequestException,
			)
		})

		it("should check that user has 2fa enabled", async () => {
			asMock(usersService.findActiveUser).mockResolvedValue(UserStub({ otpToken: null }))
			await expect(service.disableOtp(AuthUserStub(), "hello_world")).rejects.toThrow(
				BadRequestException,
			)
		})

		it("should check remove 2fa token from db", async () => {
			const user = AuthUserStub()

			asMock(usersService.findActiveUser).mockResolvedValue(UserStub({ otpToken: "1234567890" }))
			await service.disableOtp(user, "hello_world")
			expect(usersService.repo.updateById).toBeCalledWith({
				id: user.userId,
				changes: { otpToken: null },
			})
		})
	})

	describe("enableOtp", () => {
		let user: User

		let jwtService: JwtService
		let mfa: MfaService

		beforeEach(() => {
			user = UserStub({ otpToken: null })

			jwtService = module.get(JwtService)
			jwtService.verifyAsync = vi.fn(
				async () =>
					({
						secret: "1234512345",
						email: "test@example.com",
						purpose: "enable-mfa",
					} as any),
			)

			mfa = module.get(MfaService)
			mfa.checkMfa = vi.fn(async () => true)
			mfa.encryptSecret = vi.fn(async (val) => `mfa_${val}`)

			usersService.findActiveUser = vi.fn(async () => user)
			usersService.repo.updateById = vi.fn(async () => user as any)
		})

		it("should throw if provide data is invalid", async () => {
			asMock(jwtService.verifyAsync).mockResolvedValue({ hello: "world" })
			await expect(service.enableOtp({ code: "123456", jwt: "jwt" })).rejects.toThrow(
				BadRequestException,
			)
		})

		it("should prevent action if user has 2fa already enabled", async () => {
			user.otpToken = "1234512345"
			usersService.findActiveUser = vi.fn(async () => user)
			await expect(service.enableOtp({ code: "123456", jwt: "jwt" })).rejects.toThrow(
				ForbiddenException,
			)
		})

		it("should check that jwt contains valid secret", async () => {
			vi.mocked(mfa.checkMfa).mockResolvedValue(false)
			await expect(service.enableOtp({ code: "123456", jwt: "jwt" })).rejects.toThrow(
				BadRequestException,
			)
		})

		it("should save encrypted token in db", async () => {
			await service.enableOtp({ code: "123456", jwt: "jwt" })
			expect(usersService.repo.updateById).toBeCalledWith({
				id: user.id,
				changes: { otpToken: "mfa_1234512345" },
			})
		})
	})

	describe("hasMfa", () => {
		let user: UserWithSecret
		let authUser: AuthUser
		let dto: SignInDto
		beforeEach(() => {
			dto = new SignInDto({ email: "hello@example.com", password: "password" })
			user = UserStub({ otpToken: null, status: "active" })
			authUser = AuthUser.fromUser(user)

			usersService.findUserWithHiddenFields = vi.fn(async () => user)
		})

		it("should return true if user has mfa", async () => {
			const res = await service.hasMfa(authUser)
			expect(res).toEqual(false)

			user.otpToken = "qwerty"
			const res2 = await service.hasMfa(authUser)
			expect(res2).toEqual(true)
		})
	})
})
