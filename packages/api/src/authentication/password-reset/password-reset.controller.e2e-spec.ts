import { OrmRepository } from "@api/database/orm-specs/OrmRepository"
import { RepoManager } from "@api/database/orm-specs/RepoManager"
import { EmailService } from "@api/email/email.service"
import { EncryptionService } from "@api/encryption/encryption.service"
import { SecurityTokenStub } from "@api/security-tokens/security-token.stub"
import { getE2ETestModule } from "@api/testing/e2e-test-module"
import { UsersService } from "@api/users/users.service"
import { INestApplication } from "@nestjs/common"
import { randFutureDate } from "@ngneat/falso"
import {
	ADMIN_ROLE_ID,
	AnyFn,
	PasswordResetDto,
	qsStringify,
	SecurityToken,
	SecurityTokenCollection,
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
	let app: INestApplication
	let emailService: EmailService
	let encService: EncryptionService
	let usersService: UsersService
	//
	let tokenRepo: OrmRepository<SecurityToken>
	//
	let user: User
	//
	beforeAll(async () => {
		app = await getE2ETestModule({
			authentication: { allowBasicAuth: true, passwordReset: "reset-email" },
		})
		//
		encService = app.get(EncryptionService)

		emailService = app.get(EmailService)
		emailService.sendEmail = vi.fn()
		//
		usersService = app.get(UsersService)
		//
		tokenRepo = app.get(RepoManager).getRepo(SecurityTokenCollection)
	})

	afterAll(async () => {
		await usersService.repo.deleteWhere({ where: { id: user.id } })
		await app.close()
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
		await tokenRepo.deleteWhere({ where: { userId: user.id } })
		await usersService.repo.deleteById({ id: user.id })
	})

	describe("POST /auth/password-reset/request", () => {
		it("request email to reset password", async () => {
			const res = await supertest(app.getHttpServer())
				.post("/api/auth/password-reset/request")
				.send({ email: user.email })

			expect(res.statusCode).toEqual(201)
			expect(res.body).toEqual({ email: user.email })

			const tokens = await tokenRepo.findWhere({ where: { userId: user.id } })
			expect(tokens).toHaveLength(1)

			const token = tokens[0]!
			expect(token).toMatchObject({
				usedFor: "password-reset",
				userId: user.id,
			})
			const url =
				"http://localhost:7100/api/auth/password-reset/reset?" +
				qsStringify({ email: user.email, token: token.token })

			expect(emailService.sendEmail).toBeCalledWith({
				to: "e2e_pass_reset@example.com",
				subject: "Reset password",
				html: expect.stringContaining(url),
				text: "Go to " + url + " to reset password",
			})
		})
	})

	describe("GET /auth/password-reset/reset", () => {
		let token: SecurityToken

		beforeEach(async () => {
			token = await tokenRepo.createOne({
				data: SecurityTokenStub({
					usedFor: "password-reset",
					userId: user.id,
				}),
			})
		})

		it("should redirect to ui to change password", async () => {
			const query = qsStringify({ email: user.email, token: token.token })
			const res = await supertest(app.getHttpServer()).get(
				`/api/auth/password-reset/reset?${query}`,
			)

			expect(res.redirect).toEqual(true)
			expect(res.statusCode).toEqual(303)
			expect(res.headers.location).toEqual(
				`http://localhost:7100/admin#/auth/password-reset?${query}`,
			)
		})
	})

	describe("POST /auth/password-reset/reset", () => {
		let token: SecurityToken
		beforeEach(async () => {
			token = await tokenRepo.createOne({
				data: SecurityTokenStub({
					usedFor: "password-reset",
					userId: user.id,
					validUntil: randFutureDate(),
				}),
			})
		})

		it("should change password", async () => {
			const res = await supertest(app.getHttpServer())
				.put("/api/auth/password-reset/reset")
				.send(
					new PasswordResetDto({
						email: user.email,
						password: newPasswordRaw,
						token: token.token,
					}),
				)

			expect(res.statusCode).toEqual(200)
			expect(res.body).toEqual({ email: user.email })

			const fullUser = await usersService.findUserWithHiddenFields({ email: user.email })

			const validHash = await encService.verifyHash(fullUser!.password, newPasswordRaw)
			expect(validHash).toEqual(true)
		})
	})
})
