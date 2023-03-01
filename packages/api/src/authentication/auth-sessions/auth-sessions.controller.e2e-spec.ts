import { OrmRepository } from "@api/database/orm-specs/OrmRepository"
import { RepoManager } from "@api/database/orm-specs/RepoManager"
import { getE2ETestModule } from "@api/testing/e2e-test-module"
import { fixTestDate } from "@api/testing/stringify-date"
import { UsersService } from "@api/users/users.service"
import { INestApplication } from "@nestjs/common"
import {
	ADMIN_ROLE_ID,
	AuthSession,
	AuthSessionCollection,
	qsStringify,
	times,
	User,
} from "@zmaj-js/common"
import { UserStub } from "@zmaj-js/test-utils"
import { omit } from "radash"
import supertest from "supertest"
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest"
import { AuthSessionStub } from "./auth-session.stub"

const userAgentStub =
	// cspell:disable-next-line
	"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.88 Safari/537.36"

describe("AuthSessionsController e2e", () => {
	let app: INestApplication
	//
	let sessionRepo: OrmRepository<AuthSession>
	//
	let usersService: UsersService
	//
	let user: User

	beforeAll(async () => {
		app = await getE2ETestModule()

		usersService = app.get(UsersService)
		sessionRepo = app.get(RepoManager).getRepo(AuthSessionCollection)
	})

	afterAll(async () => {
		await app.close()
	})

	beforeEach(async () => {
		user = await usersService.createUser({
			data: UserStub({
				password: "password",
				email: "test_sessions@example.com",
				confirmedEmail: true,
				status: "active",
				roleId: ADMIN_ROLE_ID,
			}),
		})
	})

	afterEach(async () => {
		await sessionRepo.deleteWhere({ where: { userId: user.id } })
		await usersService.repo.deleteById({ id: user.id })
	})

	describe("GET /auth/sessions", () => {
		it("should get user sessions", async () => {
			const sessions = times(12, () =>
				AuthSessionStub({ userId: user.id, userAgent: userAgentStub }),
			)
			await sessionRepo.createMany({ data: sessions })

			const query = qsStringify({ limit: 5, count: true })
			const res = await supertest(app.getHttpServer())
				.get(`/api/auth/sessions?${query}`)
				.auth(user.email, "password")

			expect(res.statusCode).toEqual(200)
			expect(res.body.data).toHaveLength(5)
			expect(res.body.count).toEqual(12)

			const data: AuthSession[] = res.body.data
			const sessionIds = sessions.map((s) => s.id)
			data.forEach((s) => {
				expect(sessionIds).toContain(s.id)
			})
		})
	})

	describe("GET /auth/sessions/:id", () => {
		it("should get session by id", async () => {
			const session = await sessionRepo.createOne({
				data: AuthSessionStub({ userId: user.id, userAgent: userAgentStub }),
			})

			const res = await supertest(app.getHttpServer())
				.get(`/api/auth/sessions/${session.id}`)
				.auth(user.email, "password")

			expect(res.body.data).toEqual({
				...fixTestDate(omit(session, ["refreshToken", "validUntil"])), //
				browser: {
					name: "Chrome",
					version: "99.0.4844.88",
				},
				device: {},
				os: {
					name: "Linux",
					version: "x86_64",
				},
			})
		})
	})

	describe("DELETE /auth/sessions/:id", () => {
		it("should remove session by ID", async () => {
			const session = await sessionRepo.createOne({
				data: AuthSessionStub({ userId: user.id, userAgent: userAgentStub }),
			})

			const res = await supertest(app.getHttpServer())
				.delete(`/api/auth/sessions/${session.id}`)
				.auth(user.email, "password")

			expect(res.statusCode).toBe(200)
			expect(res.body.data).toEqual({
				...fixTestDate(omit(session, ["refreshToken", "validUntil"])), //
				browser: {
					name: "Chrome",
					version: "99.0.4844.88",
				},
				device: {},
				os: {
					name: "Linux",
					version: "x86_64",
				},
			})

			const inDb = await sessionRepo.findOne({ where: { id: session.id } })
			expect(inDb).toBeUndefined()
		})
	})
})
