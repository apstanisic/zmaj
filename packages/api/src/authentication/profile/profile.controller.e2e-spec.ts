import { EncryptionService } from "@api/encryption/encryption.service"
import { getE2ETestModule } from "@api/testing/e2e-test-module"
import { UsersService } from "@api/users/users.service"
import { INestApplication } from "@nestjs/common"
import {
	ADMIN_ROLE_ID,
	User,
	UserCreateDto,
	UserUpdateDto,
	UserUpdatePasswordDto,
} from "@zmaj-js/common"
import { UserStub } from "@zmaj-js/test-utils"
import supertest from "supertest"
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest"

describe("ProfileController e2e", () => {
	let app: INestApplication
	let encService: EncryptionService
	let usersService: UsersService
	//
	let user: User
	//
	beforeAll(async () => {
		app = await getE2ETestModule()
		usersService = app.get(UsersService)
		encService = app.get(EncryptionService)
	})

	afterAll(async () => {
		await app.close()
	})

	beforeEach(async () => {
		const stub = UserStub({
			firstName: "Test",
			email: "profile_test@example.com",
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

	describe("GET /auth/account/profile", () => {
		it("should get current user's profile", async () => {
			const res = await supertest(app.getHttpServer())
				.get("/api/auth/account/profile")
				.auth(user.email, "password")

			expect(res.statusCode).toEqual(200)
			expect(res.body.data).toEqual({
				id: user.id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
			})
		})
	})

	describe("PUT /auth/account/profile", () => {
		it("should update profile", async () => {
			const dto = new UserUpdateDto({ firstName: "new_name_test" })
			const res = await supertest(app.getHttpServer())
				.put("/api/auth/account/profile")
				.auth(user.email, "password")
				.send(dto)

			expect(res.statusCode).toEqual(200)
			expect(res.body.data).toMatchObject(dto)

			const updatedUser = await usersService.findUser({ id: user.id })
			expect(updatedUser?.firstName).toEqual("new_name_test")
		})
	})

	describe("PUT /auth/account/password", () => {
		it("should update user password", async () => {
			const dto = new UserUpdatePasswordDto({ newPassword: "secret123", oldPassword: "password" })
			const res = await supertest(app.getHttpServer())
				.put("/api/auth/account/password")
				.auth(user.email, "password")
				.send(dto)

			expect(res.statusCode).toEqual(200)
			expect(res.body).toMatchObject({ email: user.email })

			const updatedUser = await app.get(UsersService).findUserWithHiddenFields({ id: user.id })

			const newPasswordValid = await encService.verifyHash(updatedUser!.password, "secret123")
			expect(newPasswordValid).toEqual(true)
		})
	})
})
