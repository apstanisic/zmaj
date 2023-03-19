import { buildTestModule } from "@api/testing/build-test-module"
import { UsersService } from "@api/users/users.service"
import { BadRequestException, ForbiddenException, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { asMock, AuthUser, SignInDto, User, uuidRegex } from "@zmaj-js/common"
import { AuthUserStub, UserStub } from "@zmaj-js/test-utils"
import { pick } from "radash"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthSessionStub } from "./auth-sessions/auth-session.stub"
import { AuthSessionsService } from "./auth-sessions/auth-sessions.service"
import { AuthenticationConfig } from "./authentication.config"
import { AuthenticationService } from "./authentication.service"
import { MfaService } from "./mfa/mfa.service"
import { SignUpService } from "./sign-up/sign-up.service"

describe("AuthenticationService", () => {
	let service: AuthenticationService
	//
	let usersService: UsersService
	let sessionsService: AuthSessionsService
	let jwtService: JwtService
	let signUpService: SignUpService
	let authnConfig: AuthenticationConfig
	let mfa: MfaService

	beforeEach(async () => {
		const module = await buildTestModule(AuthenticationService).compile()

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
	/**
	 *
	 */
	describe("signInWithPassword", () => {
		let dto: SignInDto
		let fullUser: User
		let user: AuthUser
		const ip = "127.0.0.1"
		const userAgent = "SOME_USER_AGENT"

		beforeEach(() => {
			fullUser = UserStub()
			user = AuthUser.fromUser(fullUser)
			dto = new SignInDto({ email: fullUser.email, password: "hello_world" })

			service.getUserByEmailAndPassword = vi.fn().mockImplementation(async () => fullUser)
			// service.verifyOtp = vi.fn(async () => {})
			jwtService.signAsync = vi.fn().mockResolvedValue("jwt-token")
			sessionsService.createSession = vi.fn().mockResolvedValue("refresh-token")
			service.getSignInUser = vi.fn(async () => fullUser as any)
		})

		it("should get user with provided email, password and otp", async () => {
			await service.signInWithPassword(dto, { ip })
			expect(service.getSignInUser).toBeCalledWith(dto)
		})

		it("should throw on invalid data", async () => {
			asMock(service.getSignInUser).mockRejectedValue(new BadRequestException(123))
			await expect(service.signInWithPassword(dto, { ip })).rejects.toThrow(BadRequestException)
		})

		// get sign in user does that
		// it("should check 2fa", async () => {
		// 	dto.otpToken = "123456"
		// 	await service.signInWithPassword(dto, { ip })
		// 	expect(service.verifyOtp).toBeCalledWith(fullUser, "123456")
		// })

		it("should create access token for user", async () => {
			await service.signInWithPassword(dto, { ip })
			expect(jwtService.signAsync).toBeCalledWith(pick(user, ["userId", "roleId", "email"]))
		})

		it("should store new session in db", async () => {
			await service.signInWithPassword(dto, { ip, userAgent })
			expect(sessionsService.createSession).toBeCalledWith(user, { ip, userAgent })
		})

		it("should return access and refresh tokens", async () => {
			const res = await service.signInWithPassword(dto, { ip })
			expect(res).toEqual({ refreshToken: "refresh-token", accessToken: "jwt-token" })
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

	describe("getUserByEmailAndPassword", () => {
		let userStub: User

		beforeEach(() => {
			userStub = UserStub({
				status: "active",
				confirmedEmail: true,
				email: "test_234@example.com",
				// passwordExpiresAt: null,
			})
			usersService.findActiveUser = vi.fn(async () => userStub)
			usersService.checkPassword = vi.fn().mockResolvedValue(true)
		})

		it("should throw if there is no relevant active user", async () => {
			asMock(usersService.findActiveUser).mockRejectedValue(new ForbiddenException())
			await expect(service.getUserByEmailAndPassword("email", "password")).rejects.toThrow(
				ForbiddenException,
			)
		})

		it("should throw if password is invalid", async () => {
			asMock(usersService.checkPassword).mockResolvedValue(false)
			await expect(service.getUserByEmailAndPassword("email", "password")).rejects.toThrow(
				UnauthorizedException,
			)
		})

		// it("should throw if password expired", async () => {
		//   userStub.passwordExpiresAt = randPastDate()

		//   await expect(service.getUserByEmailAndPassword("email", "password")).rejects.toThrow(
		//     ForbiddenException,
		//   )
		// })

		it("should return user", async () => {
			const res = await service.getUserByEmailAndPassword("email", "password")
			expect(res).toEqual(userStub)
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
			await service.signInWithoutPassword(user, params)
			expect(sessionsService.createSession).toBeCalledWith(user, params)
		})
		it("should get access token with created session", async () => {
			await service.signInWithoutPassword(user, params)
			expect(service.getNewAccessToken).toBeCalledWith("r-token")
		})
		it("should return access and refresh tokens", async () => {
			const res = await service.signInWithoutPassword(user, params)
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
