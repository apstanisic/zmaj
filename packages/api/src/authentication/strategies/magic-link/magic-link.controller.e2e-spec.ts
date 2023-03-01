import { AuthSessionsService } from "@api/authentication/auth-sessions/auth-sessions.service"
import { EmailService } from "@api/email/email.service"
import { getE2ETestModule } from "@api/testing/e2e-test-module"
import { UsersService } from "@api/users/users.service"
import { INestApplication } from "@nestjs/common"
import { ADMIN_ROLE_ID, User, UserCreateDto } from "@zmaj-js/common"
import { UserStub } from "@zmaj-js/test-utils"
import { Server } from "http"
import supertest from "supertest"
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, Mock, vi } from "vitest"

describe("MagicLinkController e2e", () => {
	let app: INestApplication
	let usersService: UsersService
	let sessionsService: AuthSessionsService
	let emailService: EmailService

	const sendEmail: Mock = vi.fn()
	//
	let user: User
	//
	beforeAll(async () => {
		app = await getE2ETestModule()
		usersService = app.get(UsersService)
		sessionsService = app.get(AuthSessionsService)

		emailService = app.get(EmailService)
		emailService.sendEmail = sendEmail
	})

	afterAll(async () => {
		await app.close()
	})

	beforeEach(async () => {
		sendEmail.mockClear()
		const stub = UserStub({
			email: "magic_link@example.com",
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

	describe("POST /auth/magic-link", () => {
		it("should send magic link url", async () => {
			const res = await supertest(app.getHttpServer())
				.post("/api/auth/magic-link")
				.send({ destination: "magic_link@example.com" })

			expect(res.statusCode).toEqual(201)
			expect(res.body).toEqual({
				code: expect.any(String),
				success: true,
			})
			const jwtRegexInUrl =
				/(.)*http:\/\/localhost:7100\/api\/auth\/magic-link\/callback\?token=([\w-])*\.([\w-])*\.([\w-])*/

			expect(sendEmail).toBeCalledWith({
				subject: "Sign-in link",
				text: expect.stringMatching(jwtRegexInUrl),
				html: expect.stringMatching(jwtRegexInUrl),
				to: "magic_link@example.com",
			})
		})
	})

	describe("GET /auth/magic-link/callback", () => {
		it("should sign in user", async () => {
			const server: Server = app.getHttpServer()
			await supertest(server)
				.post("/api/auth/magic-link")
				.send({ destination: "magic_link@example.com" })

			const firstCall = sendEmail.mock.calls[0]
			const firstArg = firstCall[0]
			const text: string = firstArg.text
			expect(text).toBeDefined()
			const url = text.match(/(http|https)?:\/\/([^"\s])+/)?.[0]
			expect(typeof url).toEqual("string")

			//   new URL(url).
			const urlObj = new URL(url!)
			const withoutRoot = urlObj.pathname + urlObj.search

			const res = await supertest(app.getHttpServer()).get(withoutRoot)

			expect(res.statusCode).toEqual(303)
			expect(res.redirect).toEqual(true)
			expect(res.headers.location).toEqual("http://localhost:7100/admin#/auth/success-redirect")

			const sessions = await sessionsService.repo.findWhere({ where: { userId: user.id } })
			expect(sessions).toHaveLength(1)
		})
	})
})
