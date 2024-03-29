import { getE2ETestModule } from "@api/testing/e2e-test-module"
import { INestApplication } from "@nestjs/common"
import { PUBLIC_ROLE_ID, SignUpDto, UserModel } from "@zmaj-js/common"
import { OrmRepository, RepoManager } from "@zmaj-js/orm"
import supertest from "supertest"
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest"

describe("SignUpController e2e", () => {
	let app: INestApplication
	let userRepo: OrmRepository<UserModel>

	beforeAll(async () => {
		app = await getE2ETestModule({
			authentication: { allowBasicAuth: true, allowSignUp: true },
		})
		userRepo = app.get(RepoManager).getRepo(UserModel)
	})

	afterAll(async () => {
		await app.close()
	})

	describe("POST /auth/sign-up", () => {
		afterEach(async () => {
			await userRepo.deleteWhere({ where: { email: "sign_up_test@example.com" } })
		})

		it("should sign up new user", async () => {
			const dto = new SignUpDto({ email: "sign_up_test@example.com", password: "password" })

			const res = await supertest(app.getHttpServer())
				.post("/api/auth/sign-up") //
				.send(dto)

			expect(res.statusCode).toEqual(201)

			const user = await userRepo.findOneOrThrow({ where: { email: dto.email } })

			expect(res.body).toMatchObject({
				email: user.email,
				roleId: PUBLIC_ROLE_ID,
				userId: user.id,
			})

			expect(user).toMatchObject({
				email: dto.email,
				roleId: PUBLIC_ROLE_ID,
				confirmedEmail: false,
				status: "emailUnconfirmed",
			})
		})
	})

	describe("GET /auth/sign-up/allowed", () => {
		it("should check if we can sign up", async () => {
			const res = await supertest(app.getHttpServer()).get("/api/auth/sign-up/allowed") //

			expect(res.statusCode).toEqual(200)
			expect(res.body).toMatchObject({ allowed: true })
		})
	})
})
