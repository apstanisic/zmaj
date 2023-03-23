import { buildTestModule } from "@api/testing/build-test-module"
import { UsersService } from "@api/users/users.service"
import { BadRequestException, ForbiddenException, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { TestingModule } from "@nestjs/testing"
import { asMock, AuthUser, SignInDto, User, UserWithSecret, uuidRegex } from "@zmaj-js/common"
import { AuthUserStub, UserStub } from "@zmaj-js/test-utils"
import { pick } from "radash"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthSessionStub } from "./auth-sessions/auth-session.stub"
import { AuthSessionsService } from "./auth-sessions/auth-sessions.service"
import { AuthenticationConfig } from "./authentication.config"
import { AuthenticationService } from "./authentication.service"
import { MfaService } from "./mfa/mfa.service"
import { SignUpService } from "./sign-up/sign-up.service"
import { AuthorizationService } from "@api/authorization/authorization.service"

describe("AuthenticationService", () => {
	let module: TestingModule
	let service: AuthenticationService
	//
	let usersService: UsersService
	let sessionsService: AuthSessionsService
	let jwtService: JwtService
	let signUpService: SignUpService
	let authnConfig: AuthenticationConfig
	let mfa: MfaService

	beforeEach(async () => {
		module = await buildTestModule(AuthenticationService).compile()

		service = module.get(AuthenticationService)
		//
		usersService = module.get(UsersService)
		sessionsService = module.get(AuthSessionsService)
		jwtService = module.get(JwtService)
		signUpService = module.get(SignUpService)
		authnConfig = module.get(AuthenticationConfig)
		mfa = module.get(MfaService)
	})

	it("should compile", () => {
		expect(service).toBeDefined()
	})

	describe("emailAndPasswordSignIn", () => {
		let authzService: AuthorizationService
		let dto: SignInDto
		let fullUser: UserWithSecret
		let user: AuthUser
		const ip = "127.0.0.1"
		const userAgent = "SOME_USER_AGENT"

		beforeEach(() => {
			authzService = module.get(AuthorizationService)
			mfa.generateParamsToEnable = vi.fn(() =>
				Promise.resolve({
					image: "base64:123",
					secret: "MY_SECRET",
					jwt: "JWT_FOR_USER",
					backupCodes: ["hello"],
				}),
			)
			fullUser = UserStub({ otpToken: null, status: "active" })
			user = AuthUser.fromUser(fullUser)
			dto = new SignInDto({ email: fullUser.email, password: "hello_world" })

			usersService.findUserWithHiddenFields = vi.fn(async () => fullUser)
			usersService.checkPasswordHash = vi.fn(async () => true)
			service.verifyOtp = vi.fn(async () => undefined)
			service.createAuthSession = vi.fn(async () => ({
				user,
				accessToken: "my_at",
				refreshToken: "my_rt",
			}))
			authzService.roleRequireMfa = vi.fn(() => false)

			// service.verifyOtp = vi.fn(async () => {})
			jwtService.signAsync = vi.fn().mockResolvedValue("jwt-token")
			sessionsService.createSession = vi.fn().mockResolvedValue("refresh-token")
		})

		it("should throw if user does not exist", async () => {
			vi.mocked(usersService.findUserWithHiddenFields).mockResolvedValue(undefined)

			await expect(service.emailAndPasswordSignIn(dto, { ip, userAgent })).rejects.toThrow(
				UnauthorizedException,
			)
		})

		it("should throw if user is not active", async () => {
			fullUser.status = "disabled"

			await expect(service.emailAndPasswordSignIn(dto, { ip, userAgent })).rejects.toThrow(
				ForbiddenException,
			)
		})

		it("should throw if password is invalid", async () => {
			vi.mocked(usersService.checkPasswordHash).mockResolvedValue(false)
			await expect(service.emailAndPasswordSignIn(dto, { ip, userAgent })).rejects.toThrow(
				BadRequestException,
			)
		})

		it("should return info that mfa is missing (GUI will first try without otp)", async () => {
			fullUser.otpToken = "HELLO_WORLD"

			const res = await service.emailAndPasswordSignIn(dto, { ip, userAgent })
			expect(res).toEqual({ status: "has-mfa" })
		})

		it("should throw if otp token is invalid", async () => {
			fullUser.otpToken = "hello"
			dto.otpToken = "123456"
			vi.mocked(service.verifyOtp).mockRejectedValue(new BadRequestException())

			await expect(service.emailAndPasswordSignIn(dto, { ip, userAgent })).rejects.toThrow(
				BadRequestException,
			)
		})

		it("should return info that role requires mfa enabled with data to enable it", async () => {
			vi.mocked(authzService.roleRequireMfa).mockReturnValue(true)
			const res = await service.emailAndPasswordSignIn(dto, { ip, userAgent })
			expect(res).toEqual({ status: "must-create-mfa", data: expect.any(Object) })
		})

		it("should create auth session", async () => {
			await service.emailAndPasswordSignIn(dto, { ip, userAgent })
			expect(service.createAuthSession).toBeCalledWith(user, { ip, userAgent })
		})

		it("should return access and refresh token", async () => {
			const res = await service.emailAndPasswordSignIn(dto, { ip, userAgent })
			expect(res).toEqual({
				status: "signed-in",
				user,
				refreshToken: "my_rt",
				accessToken: "my_at",
			})
		})
	})

	/**
	 *
	 */
	describe("signOut", () => {
		beforeEach(() => {
			sessionsService.removeByRefreshToken = vi.fn()
		})

		it("should remove session for provided refresh token", async () => {
			await service.signOut("hello_world")
			expect(sessionsService.removeByRefreshToken).toBeCalledWith("hello_world")
		})
	})

	/**
	 *
	 */
	describe("getNewAccessToken", () => {
		let userStub: User

		beforeEach(() => {
			userStub = UserStub()
			//
			jwtService.signAsync = vi.fn().mockImplementation((v) => ({ ...v, signed: true }))
			sessionsService.extendSessionValidity = vi.fn().mockResolvedValue(AuthSessionStub())
			usersService.findUser = vi.fn().mockImplementation(async () => userStub)
		})

		it("should throw if refresh token not provided", async () => {
			await expect(service.getNewAccessToken()).rejects.toThrow(UnauthorizedException)
		})

		it("should extend session validity", async () => {
			await service.getNewAccessToken("r-token")
			expect(sessionsService.extendSessionValidity).toBeCalledWith("r-token")
		})

		it("should create new access token", async () => {
			const res = await service.getNewAccessToken("r-token")
			expect(res).toEqual({
				userId: userStub.id,
				roleId: userStub.roleId,
				email: userStub.email,
				signed: true,
			})
		})
	})

	/**
	 *
	 */
	describe("signInWithoutPassword", () => {
		let user: AuthUser
		let params: { ip: string; userAgent: string }
		beforeEach(() => {
			user = AuthUserStub()
			params = { ip: "10.0.0.0", userAgent: "ua" }

			sessionsService.createSession = vi.fn().mockResolvedValue("r-token")
			service.getNewAccessToken = vi.fn().mockResolvedValue("a-token")
		})

		it("should create auth session", async () => {
			await service.createAuthSession(user, params)
			expect(sessionsService.createSession).toBeCalledWith(user, params)
		})
		it("should get access token with created session", async () => {
			await service.createAuthSession(user, params)
			expect(service.getNewAccessToken).toBeCalledWith("r-token")
		})
		it("should return access and refresh tokens", async () => {
			const res = await service.createAuthSession(user, params)
			expect(res).toEqual({ refreshToken: "r-token", accessToken: "a-token" })
		})
	})

	/**
	 *
	 */
	describe("oauthSignIn", () => {
		let fullUser: User
		beforeEach(() => {
			fullUser = UserStub()
			usersService.findActiveUser = vi.fn().mockImplementation(async () => fullUser)
		})

		it("should throw if email is not valid", async () => {
			await expect(service.oauthSignIn({ email: "invalid", emailVerified: true })).rejects.toThrow(
				BadRequestException,
			)
		})
		it("should throw if email is not verified", async () => {
			await expect(
				service.oauthSignIn({ email: "valid@example.com", emailVerified: false }),
			).rejects.toThrow(ForbiddenException)
		})

		it("should sign in user if exists", async () => {
			const res = await service.oauthSignIn({
				email: "valid@example.com",
				emailVerified: true,
			})
			expect(res).toEqual(AuthUser.fromUser(fullUser))
		})

		it("should throw if oauth sign up is not allowed", async () => {
			authnConfig.allowOAuthSignUp = false
			asMock(usersService.findActiveUser).mockResolvedValue(undefined)

			await expect(
				service.oauthSignIn({ email: "valid@example.com", emailVerified: true }),
			).rejects.toThrow(ForbiddenException)
		})

		it("should try to sign up user if they don't have account", async () => {
			authnConfig.allowOAuthSignUp = true
			asMock(usersService.findActiveUser).mockResolvedValue(undefined)
			signUpService.signUp = vi.fn().mockImplementation(async () => fullUser)
			const res = await service.oauthSignIn({
				email: "valid@example.com",
				emailVerified: true,
				firstName: "hello",
				lastName: "world",
				photoUrl: "img.jpg",
			})
			expect(signUpService.signUp).toBeCalledWith(
				{
					email: "valid@example.com",
					password: expect.stringMatching(uuidRegex),
					firstName: "hello",
					lastName: "world",
				},
				{
					confirmedEmail: true,
					status: "active",
				},
			)
			expect(res).toEqual(AuthUser.fromUser(fullUser))
		})
		//
	})

	describe("verifyOtp", () => {
		beforeEach(() => {
			mfa.checkMfa = vi.fn(async () => true)
		})

		it("should do nothing if user does not have 2fa enabled", async () => {
			const user = UserStub({ otpToken: null })
			await service.verifyOtp(user, "123456")
			expect(mfa.checkMfa).not.toBeCalled()
		})

		it("should check if user does have 2fa enabled", async () => {
			const user = UserStub({ otpToken: "hello_world_123" })
			await service.verifyOtp(user, "123456")
			expect(mfa.checkMfa).toBeCalledWith("hello_world_123", "123456")
		})

		it("should throw if 2fa token is invalid", async () => {
			asMock(mfa.checkMfa).mockResolvedValue(false)
			const user = UserStub({ otpToken: "hello_world_123" })
			await expect(service.verifyOtp(user, "123456")).rejects.toThrow(UnauthorizedException)
		})
	})
})
