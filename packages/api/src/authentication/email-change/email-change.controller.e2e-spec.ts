import { EmailService } from "@api/email/email.service"
import { SecurityTokenStub } from "@api/security-tokens/security-token.stub"
import { getE2ETestModule } from "@api/testing/e2e-test-module"
import { UsersService } from "@api/users/users.service"
import { INestApplication } from "@nestjs/common"
import {
	ADMIN_ROLE_ID,
	ChangeEmailDto,
	qsStringify,
	SecurityTokenModel,
	User,
	UserCreateDto,
	UserModel,
} from "@zmaj-js/common"
import { OrmRepository, RepoManager } from "@zmaj-js/orm"
import { UserStub } from "@zmaj-js/test-utils"
import { addMinutes } from "date-fns"
import { omit } from "radash"
import supertest from "supertest"
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"

describe("EmailChangeController e2e", () => {
	let app: INestApplication
	let emailService: EmailService
	//
	let userRepo: OrmRepository<UserModel>
	let tokenRepo: OrmRepository<SecurityTokenModel>
	//
	let user: User
	//
	beforeAll(async () => {
		app = await getE2ETestModule()
		userRepo = app.get(RepoManager).getRepo(UserModel)
		tokenRepo = app.get(RepoManager).getRepo(SecurityTokenModel)

		emailService = app.get(EmailService)
		emailService.sendEmail = vi.fn()
	})

	afterAll(async () => {
		await app.close()
	})

	beforeEach(async () => {
		const userData = UserStub({
			email: "e2e_email_change_current@example.com",
			confirmedEmail: true,
			status: "active",
			roleId: ADMIN_ROLE_ID,
		})

		user = await app
			.get(UsersService)
			.createUser({ data: new UserCreateDto({ ...userData, password: "password" }) })
	})

	afterEach(async () => {
		await tokenRepo.deleteWhere({ where: { userId: user.id } })
		await userRepo.deleteById({ id: user.id })
	})

	describe("PUT /auth/account/email-change", () => {
		it("should request email change", async () => {
			//
			const res = await supertest(app.getHttpServer())
				.put("/api/auth/account/email-change")
				.send(
					new ChangeEmailDto({
						newEmail: "e2e_email_change_new@example.com",
						password: "password",
					}),
				)
				.auth(user.email, "password")

			expect(res.statusCode).toEqual(200)
			expect(res.body).toEqual({
				currentEmail: "e2e_email_change_current@example.com",
				newEmail: "e2e_email_change_new@example.com",
			})

			const tokens = await tokenRepo.findWhere({ where: { userId: user.id } })
			expect(tokens[0]).toMatchObject({
				usedFor: "email-change",
				userId: user.id,
				data: "e2e_email_change_new@example.com",
			})

			const query = qsStringify({ userId: user.id, token: tokens[0]!.token })
			const url = `http://localhost:7100/api/auth/account/email-change/confirm?${query}`
			expect(emailService.sendEmail).toBeCalledWith({
				subject: "Confirm email change",
				text: "Go to " + url + " to confirm email change",
				to: "e2e_email_change_new@example.com",
				html: expect.stringContaining(url),
			})
		})
	})

	describe("GET /auth/account/email-change/confirm", () => {
		it("should change email", async () => {
			const newEmail = "e2e_email_change_new@example.com"

			const tokenStub = SecurityTokenStub({
				usedFor: "email-change",
				userId: user.id,
				data: newEmail,
				validUntil: addMinutes(new Date(), 30),
			})
			const token = await tokenRepo.createOne({ data: omit(tokenStub, ["createdAt"]) })

			const query = qsStringify({ userId: user.id, token: token.token })
			const res = await supertest(app.getHttpServer()).get(
				`/api/auth/account/email-change/confirm?${query}`,
			)

			expect(res.statusCode).toBe(200)
			expect(res.body).toEqual({ email: newEmail })

			const updatedUser = await userRepo.findById({ id: user.id })
			expect(updatedUser.email).toEqual(newEmail)

			const tokenAfterChange = await tokenRepo.findOne({ where: token.id })
			expect(tokenAfterChange).toBeUndefined()
		})
		//
	})
})
