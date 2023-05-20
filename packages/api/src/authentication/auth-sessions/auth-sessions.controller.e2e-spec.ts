import { getE2ETestModule } from "@api/testing/e2e-test-module"
import { fixTestDate } from "@api/testing/stringify-date"
import { UsersService } from "@api/users/users.service"
import { INestApplication } from "@nestjs/common"
import {
	ADMIN_ROLE_ID,
	AuthSession,
	AuthSessionModel,
	PublicAuthSession,
	qsStringify,
	times,
	User,
} from "@zmaj-js/common"
import { OrmRepository, RepoManager } from "@zmaj-js/orm"
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
	let sessionRepo: OrmRepository<AuthSessionModel>
	//
	let usersService: UsersService
	//
	let user: User

	beforeAll(async () => {
		app = await getE2ETestModule()

		usersService = app.get(UsersService)
		sessionRepo = app.get(RepoManager).getRepo(AuthSessionModel)
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
				otpToken: null,
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
				omit(AuthSessionStub({ userId: user.id, userAgent: userAgentStub }), ["createdAt"]),
			)
			await sessionRepo.createMany({ data: sessions })

			const query = qsStringify({ limit: 5, count: true, sort: { createdAt: "ASC" } })
			const res = await supertest(app.getHttpServer())
				.get(`/api/auth/sessions?${query}`)
				.auth(user.email, "password")

			expect(res.statusCode).toEqual(200)
			expect(res.body.data).toHaveLength(5)
			// basic auth creates short lived auth session
			expect(res.body.count).toEqual(12 + 1)

			const data: AuthSession[] = res.body.data
			const sessionIds = sessions.map((s) => s.id)
			expect(data.every((session) => session.refreshToken === undefined)).toEqual(true)
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

			const data = res.body.data as PublicAuthSession
			expect((data as AuthSession).refreshToken).toBeUndefined()

			expect(data).toEqual({
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

			const data = res.body.data as PublicAuthSession
			expect((data as AuthSession).refreshToken).toBeUndefined()

			expect(res.statusCode).toBe(200)
			expect(data).toEqual({
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
