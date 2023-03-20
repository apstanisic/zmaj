import { EncryptionService } from "@api/encryption/encryption.service"
import { getE2ETestModule } from "@api/testing/e2e-test-module"
import { UsersService } from "@api/users/users.service"
import { INestApplication } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { AuthUser, REFRESH_COOKIE_NAME, SignInDto, User, uuidRegex } from "@zmaj-js/common"
import { UserStub } from "@zmaj-js/test-utils"
import { addDays, addMinutes, differenceInHours, getUnixTime } from "date-fns"
import supertest from "supertest"
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	SpyInstance,
	vi,
} from "vitest"
import { AuthSessionsService } from "./auth-sessions/auth-sessions.service"
import { RefreshTokenService } from "./refresh-token.service"

describe("AuthenticationController e2e", () => {
	let app: INestApplication
	let usersService: UsersService
	let refreshTokenService: RefreshTokenService
	let sessionsService: AuthSessionsService
	let jwtService: JwtService
	let encryptionService: EncryptionService

	let setCookieSpy: SpyInstance
	let removeCookieSpy: SpyInstance

	let fullUser: User
	let user: AuthUser

	beforeAll(async () => {
		app = await getE2ETestModule({ authentication: { allowBasicAuth: true, allowSignUp: true } })
		usersService = app.get(UsersService)
		refreshTokenService = app.get(RefreshTokenService)
		sessionsService = app.get(AuthSessionsService)
		jwtService = app.get(JwtService)
		encryptionService = app.get(EncryptionService)
	})

	afterAll(async () => {
		await app.close()
	})

	beforeEach(async () => {
		fullUser = await usersService.createUser({
			data: UserStub({
				email: "sign_in_test@example.com",
				confirmedEmail: true,
				status: "active",
				password: "password",
			}),
		})
		user = AuthUser.fromUser(fullUser)
		setCookieSpy = vi.spyOn(refreshTokenService, "set").mockImplementation(() => {})
		removeCookieSpy = vi.spyOn(refreshTokenService, "remove").mockImplementation(() => {})
	})

	afterEach(async () => {
		await usersService.repo.deleteById({ id: fullUser.id })
	})

	/**
	 *
	 */
	describe("POST /auth/sign-in", () => {
		it("should sign in user", async () => {
			const res = await supertest(app.getHttpServer())
				.post("/api/auth/sign-in") //
				.send(new SignInDto({ email: "sign_in_test@example.com", password: "password" }))

			// not always created, so it should not be 201
			expect(res.statusCode).toEqual(200)

			// should have created session (not returning refresh token)
			const sessions = await sessionsService.repo.findWhere({ where: { userId: fullUser.id } })
			expect(sessions).toHaveLength(1)

			// cookies should be encrypted refresh token
			const encryptedRefreshToken = setCookieSpy?.mock?.lastCall?.[1]
			const decrypted = await encryptionService.decrypt(encryptedRefreshToken)
			expect(decrypted).toMatch(uuidRegex)
			// refresh token is hidden
			// expect(sessions[0]!.refreshToken).toEqual(decrypted)
			// expect(refreshTokenService.set).toBeCalledWith(expect.anything(), sessions[0]!.refreshToken)

			// should return jwt token as string
			expect(res.body).toEqual({
				accessToken: expect.any(String),
				status: "signed-in",
				user: expect.any(Object),
			})
			const jwtToken = jwtService.decode(res.body.accessToken)
			expect(jwtToken).toMatchObject(user)
		})
	})

	/**
	 *
	 */
	describe("DELETE /auth/sign-out", () => {
		let refreshToken: string

		beforeEach(async () => {
			refreshToken = await sessionsService.createSession(
				AuthUser.fromUser(fullUser), //
				{ ip: "127.0.0.1" },
			)
		})

		it("should sign user out", async () => {
			const res = await supertest(app.getHttpServer())
				.delete("/api/auth/sign-out")
				.set("Cookie", `${REFRESH_COOKIE_NAME}=${refreshToken}`)

			expect(res.statusCode).toEqual(200)
			expect(res.body).toEqual({ success: true })

			expect(removeCookieSpy).toBeCalled()

			const sessions = await sessionsService.repo.findWhere({ where: { userId: fullUser.id } })
			expect(sessions).toHaveLength(0)
		})
	})

	/**
	 *
	 */
	describe("POST /auth/access-token", () => {
		let refreshToken: string

		beforeEach(async () => {
			// vi.useFakeTimers({ advanceTimeDelta: 2000, shouldAdvanceTime: true })
			vi.useFakeTimers()

			refreshToken = await sessionsService.createSession(
				AuthUser.fromUser(fullUser), //
				{ ip: "127.0.0.1" },
			)
		})

		afterEach(async () => {
			vi.useRealTimers()
		})

		it("get new access token", async () => {
			const now = new Date()
			const res = await supertest(app.getHttpServer())
				.post("/api/auth/access-token")
				.set("Cookie", `${REFRESH_COOKIE_NAME}=${refreshToken}`)

			expect(res.statusCode).toEqual(201)

			const jwt = jwtService.decode(res.body.accessToken)
			expect(jwt).toEqual({
				...user,
				exp: getUnixTime(addMinutes(now, 20)), //
				iat: getUnixTime(now),
			})

			const sessions = await sessionsService.repo.findWhere({ where: { userId: fullUser.id } })
			expect(sessions).toHaveLength(1)
			const session = sessions[0]!
			expect(session.lastUsed).toEqual(now)
			const in30Days = addDays(now, 30)
			// max 1 hour diff, for dst
			expect(differenceInHours(session.validUntil, in30Days)).toBeLessThanOrEqual(1)
			// we are adding 30 days worth of ms, but it will fail if daylight saving time is involved
			// expect(session.validUntil).toEqual(addDays(now, 30))
		})
	})
})
