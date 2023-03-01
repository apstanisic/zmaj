import { getE2ETestModule } from "@api/testing/e2e-test-module"
import { UsersService } from "@api/users/users.service"
import { INestApplication } from "@nestjs/common"
import { ADMIN_ROLE_ID, User, UserCreateDto } from "@zmaj-js/common"
import { UserStub } from "@zmaj-js/test-utils"
import supertest from "supertest"
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest"
import { AuthGuardTestingModule } from "../auth-guard-testing.module.mock"

describe("BasicAuthGuard e2e", () => {
	let app: INestApplication
	let usersService: UsersService
	//
	let user: User
	//
	beforeAll(async () => {
		app = await getE2ETestModule({
			customModules: [AuthGuardTestingModule],
		})
		usersService = app.get(UsersService)
	})

	afterAll(async () => {
		await app.close()
	})

	beforeEach(async () => {
		const stub = UserStub({
			firstName: "Test",
			email: "basic_auth_test@example.com",
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
		it("should properly provide user", async () => {
			const res = await supertest(app.getHttpServer())
				.get("/api/test-auth/current-user")
				.auth(user.email, "password")

			expect(res.body).toEqual({
				user: { userId: user.id, email: user.email, roleId: user.roleId },
			})
		})

		it("should throw if invalid", async () => {
			const res = await supertest(app.getHttpServer())
				.get("/api/test-auth/current-user")
				.auth(user.email, "password_bad")

			expect(res.statusCode).toEqual(401)
			expect(res.body).toEqual({
				error: expect.objectContaining({ message: "Invalid email or password" }),
			})
		})

		it("should simply have no user if token not provided", async () => {
			const res = await supertest(app.getHttpServer()).get("/api/test-auth/current-user")

			expect(res.statusCode).toEqual(200)
			expect(res.body).toEqual({ user: null })
		})
	})
})
