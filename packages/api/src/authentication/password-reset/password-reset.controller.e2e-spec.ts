import { EmailService } from "@api/email/email.service"
import { EncryptionService } from "@api/encryption/encryption.service"
import { createTestServer, TestSdk } from "@api/testing/e2e-test-module"
import { UsersService } from "@api/users/users.service"
import { INestApplication } from "@nestjs/common"
import {
	ADMIN_ROLE_ID,
	AnyFn,
	extractUrl,
	PasswordResetDto,
	User,
	UserCreateDto,
} from "@zmaj-js/common"
import supertest from "supertest"
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@zmaj-js/common", async () => ({
	...(await vi.importActual<typeof import("@zmaj-js/common")>("@zmaj-js/common")),
	minFnDuration: async (dur: number, fn: AnyFn) => {
		await fn()
	},
}))

const newPasswordRaw = "e2e_test_password"

describe("PasswordResetController e2e", () => {
	let testSdk: TestSdk
	let app: INestApplication
	let emailService: EmailService
	let encService: EncryptionService
	let usersService: UsersService
	//
	let user: User
	//
	beforeAll(async () => {
		testSdk = await createTestServer({
			authentication: { allowBasicAuth: true, passwordReset: "reset-email" },
		})
		app = testSdk.app
		//
		encService = app.get(EncryptionService)

		emailService = app.get(EmailService)
		emailService.sendEmail = vi.fn()
		//
		usersService = app.get(UsersService)
	})

	afterAll(async () => {
		await usersService.repo.deleteWhere({ where: { id: user.id } })
		await testSdk.destroy()
	})

	beforeEach(async () => {
		user = await usersService.createUser({
			data: new UserCreateDto({
				email: "e2e_pass_reset@example.com",
				confirmedEmail: true,
				status: "active",
				roleId: ADMIN_ROLE_ID,
				password: "password",
			}),
		})
	})

	afterEach(async () => {
		await usersService.repo.deleteById({ id: user.id })
	})

	describe("POST /auth/password-reset/request", () => {
		it("request email to reset password", async () => {
			const res = await supertest(app.getHttpServer())
				.post("/api/auth/password-reset/request")
				.send({ email: user.email })

			expect(res.statusCode).toEqual(201)
			expect(res.body).toEqual({ email: user.email })

			expect(emailService.sendEmail).toBeCalledWith({
				to: "e2e_pass_reset@example.com",
				subject: "Reset password",
				html: expect.stringContaining("http"),
				text: expect.stringContaining("http"),
			})
		})
	})

	describe("GET /auth/password-reset/reset", () => {
		it("should redirect to ui to change password with token", async () => {
			const res = await supertest(app.getHttpServer()).get(
				`/api/auth/password-reset/reset?token=hello_world`,
			)

			expect(res.redirect).toEqual(true)
			expect(res.statusCode).toEqual(303)
			expect(res.headers.location).toEqual(
				`http://localhost:7100/admin#/auth/password-reset?token=hello_world`,
			)
		})
	})

	describe("POST /auth/password-reset/reset", () => {
		beforeEach(async () => {
			vi.mocked(emailService.sendEmail).mockClear()
		})

		it("should change password", async () => {
			const emailSend = vi.spyOn(emailService, "sendEmail")
			await supertest(app.getHttpServer())
				.put("/api/auth/password-reset/request")
				.send({ email: user.email })

			const emailText = emailSend.mock.lastCall?.[0].text?.toString()

			const url = extractUrl(emailText ?? "")
			expect(url).toBeDefined()
			const token = new URL(url!).searchParams.get("token") ?? ""

			const res = await supertest(app.getHttpServer())
				.put("/api/auth/password-reset/reset")
				.send(new PasswordResetDto({ password: "new_password", token }))

			expect(res.statusCode).toEqual(200)
			expect(res.body).toEqual({ email: user.email })

			const fullUser = await usersService.findUserWithHiddenFields({ email: user.email })

			const validHash = await encService.verifyHash(fullUser!.password, newPasswordRaw)
			expect(validHash).toEqual(true)
		})
	})
})
