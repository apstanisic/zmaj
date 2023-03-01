import { AuthenticationService, AuthTokens } from "@api/authentication/authentication.service"
import { getE2ETestModule } from "@api/testing/e2e-test-module"
import { UsersService } from "@api/users/users.service"
import { INestApplication } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { randIp } from "@ngneat/falso"
import { ADMIN_ROLE_ID, qsStringify, User, UserCreateDto } from "@zmaj-js/common"
import { UserStub } from "@zmaj-js/test-utils"
import supertest from "supertest"
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest"
import { AuthGuardTestingModule } from "../auth-guard-testing.module.mock"

describe("JwtGuard e2e", () => {
	let app: INestApplication
	let usersService: UsersService
	let authnService: AuthenticationService
	let jwtService: JwtService
	//
	let user: User
	//
	beforeAll(async () => {
		app = await getE2ETestModule({
			customModules: [AuthGuardTestingModule],
			authentication: { allowJwtInQuery: true },
		})
		usersService = app.get(UsersService)
		authnService = app.get(AuthenticationService)
		jwtService = app.get(JwtService)
	})

	afterAll(async () => {
		await app.close()
	})

	beforeEach(async () => {
		const stub = UserStub({
			firstName: "Test",
			email: "jwt_guard_test@example.com",
			confirmedEmail: true,
			roleId: ADMIN_ROLE_ID,
			status: "active",
		})

		user = await usersService.createUser({
			data: new UserCreateDto({ ...stub, password: "password" }),
		})
	})

	afterEach(async () => {
		await usersService.repo.deleteById({ id: user.id })
	})

	describe("verify", () => {
		let tokens: AuthTokens

		beforeEach(async () => {
			tokens = await authnService.signInWithPassword(
				{ email: user.email, password: "password" },
				{ ip: randIp() },
			)
		})

		it("should properly provide user", async () => {
			const res = await supertest(app.getHttpServer())
				.get("/api/test-auth/current-user")
				.set("Authorization", "Bearer " + tokens.accessToken)

			const decoded = jwtService.decode(tokens.accessToken)

			expect(res.body).toEqual({ user: decoded })
		})

		it("should throw if invalid", async () => {
			const invalidToken = "qwerty" + tokens.accessToken.substring(6)

			const res = await supertest(app.getHttpServer())
				.get("/api/test-auth/current-user")
				.set("Authorization", `Bearer ${invalidToken}`)

			expect(res.statusCode).toEqual(401)
			expect(res.body).toEqual({
				error: expect.objectContaining({ message: "Invalid authentication" }),
			})
		})

		it("should simply have no user if token not provided", async () => {
			const res = await supertest(app.getHttpServer()).get("/api/test-auth/current-user")

			expect(res.statusCode).toEqual(200)
			expect(res.body).toEqual({ user: null })
		})

		it("should login with query", async () => {
			const query = qsStringify({ accessToken: tokens.accessToken })
			const res = await supertest(app.getHttpServer()).get(`/api/test-auth/current-user?${query}`)

			const decoded = jwtService.decode(tokens.accessToken)

			expect(res.statusCode).toEqual(200)
			expect(res.body).toEqual({ user: decoded })
		})
	})
})
