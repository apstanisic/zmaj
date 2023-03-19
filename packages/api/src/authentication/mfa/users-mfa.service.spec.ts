import { buildTestModule } from "@api/testing/build-test-module"
import { UsersService } from "@api/users/users.service"
import { BadRequestException, ForbiddenException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { TestingModule } from "@nestjs/testing"
import { asMock, AuthUser, makeWritable, SignInDto, User } from "@zmaj-js/common"
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
			dbUser = UserStub({ email: "hello@example.com", status: "active" })
			//
			usersService = module.get(UsersService)
			makeWritable(usersService).repo ??= {} as any
			usersService.findActiveUser = vi.fn(async () => dbUser)
			usersService.findUserWithHiddenFields = vi.fn(async () => dbUser)
			usersService.ensureUserIsActive = vi.fn()
			mfaService = module.get(MfaService)
			mfaService.generateSecret = vi.fn(() => "secret_123")
			mfaService.generateQrCode = vi.fn(async (name, secret) => `qrcode_${name}_${secret}`)
			mfaService.calculateBackupCodes = vi.fn(async (secret) => secret.split("_"))
			jwtService = module.get(JwtService)
			jwtService.signAsync = vi.fn(async (v) => JSON.stringify(v))
		})
		it("should throw if user already has 2fa enabled", async () => {
			dbUser.otpToken = "1234512345"
			await expect(service.requestToEnableOtp(user)).rejects.toThrow(ForbiddenException)
		})

		it("should create jwt that is valid only 5 minutes", async () => {
			await service.requestToEnableOtp(user)
			expect(jwtService.signAsync).toBeCalledWith(expect.anything(), { expiresIn: 300 })
		})

		it("should send secret, secret as a jwt, backup codes and qr code", async () => {
			const res = await service.requestToEnableOtp(user)
			expect(res.backupCodes).toEqual(["secret", "123"])
			expect(res.jwt).toEqual('{"secret":"secret_123"}')
			expect(res.image).toEqual("qrcode_hello@example.com_secret_123")
			expect(res.secret).toEqual("secret_123")
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
		let aUser: AuthUser

		let jwtService: JwtService
		let mfa: MfaService

		beforeEach(() => {
			aUser = AuthUserStub()
			user = UserStub({ otpToken: null })

			jwtService = module.get(JwtService)
			jwtService.verifyAsync = vi.fn(async () => ({ secret: "1234512345" }) as any)

			mfa = module.get(MfaService)
			mfa.checkCode = vi.fn(async () => true)
			mfa.encryptSecret = vi.fn(async (val) => `mfa_${val}`)

			usersService.findActiveUser = vi.fn(async () => UserStub({ otpToken: null }))
			usersService.repo.updateById = vi.fn(async () => user as any)
		})
		it("should prevent action if user has 2fa already enabled", async () => {
			user.otpToken = "1234512345"
			usersService.findActiveUser = vi.fn(async () => user)
			await expect(service.enableOtp({ code: "123456", jwt: "jwt", user: aUser })).rejects.toThrow(
				ForbiddenException,
			)
		})

		it("should validate jwt and it's contents", async () => {
			asMock(jwtService.verifyAsync).mockResolvedValue({})
			await expect(service.enableOtp({ code: "123456", jwt: "jwt", user: aUser })).rejects.toThrow(
				BadRequestException,
			)
		})

		it("should check that jwt contains valid secret", async () => {
			mfa.checkCode = vi.fn(async () => false)
			await expect(service.enableOtp({ code: "123456", jwt: "jwt", user: aUser })).rejects.toThrow(
				BadRequestException,
			)
		})

		it("should save encrypted token in db", async () => {
			await service.enableOtp({ code: "123456", jwt: "jwt", user: aUser })
			expect(usersService.repo.updateById).toBeCalledWith({
				id: aUser.userId,
				changes: { otpToken: "mfa_1234512345" },
			})
		})
	})

	describe("hasMfa", () => {
		let user: User
		let dto: SignInDto
		beforeEach(() => {
			dto = new SignInDto({ email: "hello@example.com", password: "password" })
			user = UserStub({ otpToken: null, status: "active" })
			//
			usersService.findUserWithHiddenFields = vi.fn(async () => user as any)
			usersService.checkPasswordHash = vi.fn(async () => true)
		})

		it("should throw if user does not exist", async () => {
			asMock(usersService.findUserWithHiddenFields).mockRejectedValue(new ForbiddenException())
			await expect(service.hasMfa(dto)).rejects.toThrow(ForbiddenException)
			expect(usersService.findUserWithHiddenFields).toBeCalledWith({ email: dto.email }, undefined)
		})

		it("should throw on invalid password", async () => {
			user.password = "some-hash"
			asMock(usersService.checkPasswordHash).mockResolvedValue(false)
			await expect(service.hasMfa(dto)).rejects.toThrow(BadRequestException)
			expect(usersService.checkPasswordHash).toBeCalledWith("some-hash", "password")
		})

		it("should throw if user is not active", async () => {
			user.status = "banned"
			await expect(service.hasMfa(dto)).rejects.toThrow(ForbiddenException)
		})

		it("should return true if users's otp token exists", async () => {
			user.otpToken = "qwerty"
			const res1 = await service.hasMfa(dto)
			expect(res1).toEqual(true)

			user.otpToken = null
			asMock(usersService.findUserWithHiddenFields).mockResolvedValue(user)
			const res2 = await service.hasMfa(dto)
			expect(res2).toEqual(false)
		})
	})
})
