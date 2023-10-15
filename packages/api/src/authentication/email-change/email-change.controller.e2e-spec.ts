import { EmailService } from "@api/email/email.service"
import { TestSdk, createTestServer } from "@api/testing/e2e-test-module"
import { faker } from "@faker-js/faker"
import { INestApplication } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { ChangeEmailDto, User, UserModel, extractUrl, getJwtContent } from "@zmaj-js/common"
import supertest from "supertest"
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"

describe.only("EmailChangeController e2e", () => {
	let sdk: TestSdk
	let app: INestApplication
	let emailService: EmailService
	let jwtService: JwtService
	//
	let user: User
	//
	beforeAll(async () => {
		sdk = await createTestServer()
		app = sdk.app

		jwtService = app.get(JwtService)
		emailService = app.get(EmailService)
		emailService.sendEmail = vi.fn()
	})

	afterAll(async () => {
		await app.close()
	})

	beforeEach(async () => {
		user = await sdk.createUser()
	})

	describe("PUT /auth/account/email-change", () => {
		it("should request email change", async () => {
			const newEmail = faker.internet.email({ provider: "hello.test" })
			//
			const res = await supertest(app.getHttpServer())
				.put("/api/auth/account/email-change")
				.send(
					new ChangeEmailDto({
						newEmail,
						password: "password",
					}),
				)
				.auth(user.email, "password")

			expect(res.statusCode).toEqual(200)
			expect(res.body).toEqual({
				currentEmail: user.email,
				newEmail,
			})

			// const spy = vi.spyOn(jwtService, "signAsync")
			// const token = spy.mock.results.at(-1)
			// const url = `http://localhost:7100/api/auth/account/email-change/confirm?token=${token}`
			const commonUrl = `http://localhost:7100/api/auth/account/email-change/confirm?token=`
			expect(emailService.sendEmail).toBeCalledWith({
				subject: "Confirm email change",
				to: newEmail,
				text: expect.stringContaining(commonUrl),
				html: expect.stringContaining(commonUrl),
			})
		})
	})

	describe("GET /auth/account/email-change/confirm", () => {
		it("should change email", async () => {
			const newEmail = faker.internet.email({ provider: "hello.test" })

			const spy = vi.spyOn(app.get(EmailService), "sendEmail")

			await supertest(app.getHttpServer())
				.put("/api/auth/account/email-change")
				.send(
					new ChangeEmailDto({
						newEmail,
						password: "password",
					}),
				)
				.auth(user.email, "password")

			const emailText = spy.mock.lastCall?.[0].text?.toString()

			const url = extractUrl(emailText)
			expect(url).toBeDefined()
			const token = new URL(url!).searchParams.get("token")
			expect(token).toBeDefined()

			const res = await supertest(app.getHttpServer()).get(
				`/api/auth/account/email-change/confirm?token=${token}`,
			)

			const content = getJwtContent(token!)

			expect(res.statusCode).toBe(200)
			expect(res.body).toEqual({ email: newEmail })

			const updatedUser = await sdk
				.getRepo(UserModel)
				.findById({ id: content["sub"] as string })
			expect(updatedUser.email).toEqual(newEmail)
		})
		//
	})
})
