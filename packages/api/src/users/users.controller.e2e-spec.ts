import { getE2ETestModuleExpanded, TestBundle } from "@api/testing/e2e-test-module"
import { fixTestDate } from "@api/testing/stringify-date"
import { INestApplication } from "@nestjs/common"
import { randEmail } from "@ngneat/falso"
import { jsonDateRegex, qsStringify, times, User, UserCreateDto, uuidRegex } from "@zmaj-js/common"
import supertest from "supertest"
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest"
import { UsersService } from "./users.service"

describe("UsersController e2e", () => {
	let all: TestBundle
	let app: INestApplication
	let usersService: UsersService
	let adminUser: User
	//

	beforeAll(async () => {
		all = await getE2ETestModuleExpanded()
		app = all.app
		// repoManager = app.get(RepoManager)
		usersService = app.get(UsersService)

		adminUser = await all.createUser()
	})

	afterAll(async () => {
		await all.deleteUser(adminUser)
		await app.close()
	})
	/**
	 *
	 */
	describe("GET /users/:id", () => {
		let createdUser: User
		beforeEach(async () => {
			createdUser = await usersService.createUser({
				data: new UserCreateDto({
					email: randEmail({ provider: "example" }),
					confirmedEmail: true,
					password: "password",
				}),
			})
		})
		afterEach(async () => {
			await usersService.repo.deleteWhere({ where: createdUser.id })
		})

		it("should get user", async () => {
			const res = await supertest(app.getHttpServer())
				.get(`/api/users/${createdUser.id}`)
				.auth(adminUser.email, "password")

			expect(res.body.data).toEqual(fixTestDate(createdUser))
		})
	})

	/**
	 *
	 */
	describe("GET /users", () => {
		let users: User[]
		beforeEach(async () => {
			users = await Promise.all(
				times(15, async (i) =>
					usersService.createUser({
						data: new UserCreateDto({
							email: randEmail({ provider: "example" }),
							firstName: "UsersController",
							// make easy sort for string: id002 before id010, not id11 before id2
							lastName: `Id${i.toString().padStart(4, "0")}`,
							confirmedEmail: true,
							password: "password",
						}),
					}),
				),
			)
		})
		afterEach(async () => {
			await usersService.repo.deleteWhere({ where: users.map((u) => u.id) })
		})
		it("should get users", async () => {
			const query = qsStringify({
				count: true,
				limit: 6,
				filter: { firstName: "UsersController" },
				sort: { lastName: "ASC" },
			})
			const res = await supertest(app.getHttpServer())
				.get(`/api/users?${query}`)
				.auth(adminUser.email, "password")

			expect(res.body.count).toEqual(15)
			expect(res.body.data).toEqual(users.slice(0, 6).map((u) => fixTestDate(u)))
		})
	})

	/**
	 *
	 */
	describe("POST /users", () => {
		afterEach(async () => {
			await usersService.repo.deleteWhere({ where: { email: "user_cont_post@example.com" } })
		})
		it("should create user", async () => {
			const dto = new UserCreateDto({ email: "user_cont_post@example.com", lastName: "Hello" })
			const res = await supertest(app.getHttpServer())
				.post("/api/users")
				.auth(adminUser.email, "password")
				.send(dto)

			expect(res.statusCode).toEqual(201)
			const { password, ...withoutPassword } = dto
			expect(res.body.data).toEqual({
				...withoutPassword,
				id: expect.stringMatching(uuidRegex),
				createdAt: expect.stringMatching(jsonDateRegex),
			})
			const inDb = await usersService.findUser({ email: dto.email })

			expect(fixTestDate(inDb)).toEqual(res.body.data)
		})
	})

	/**
	 *
	 */
	describe("DELETE /users/:id", () => {
		let user: User
		beforeEach(async () => {
			user = await usersService.createUser({
				data: new UserCreateDto({ email: "delete_user_cont@example.com" }),
			})
		})
		it("should delete record", async () => {
			const inDbBefore = await usersService.findUser({ id: user.id })
			expect(inDbBefore).toBeDefined()

			const res = await supertest(app.getHttpServer())
				.delete(`/api/users/${user.id}`)
				.auth(adminUser.email, "password")

			expect(res.body.data).toEqual(fixTestDate(user))

			const inDbAfter = await usersService.findUser({ id: user.id })
			expect(inDbAfter).toBeUndefined()
		})
	})

	/**
	 *
	 */
	describe("UPDATE /users/:id", () => {
		let dbUser: User
		beforeEach(async () => {
			dbUser = await usersService.createUser({
				data: new UserCreateDto({ email: "update_test_user_cont@example.com", firstName: "name1" }),
			})
		})

		afterEach(async () => {
			await usersService.repo.deleteById({ id: dbUser.id })
		})

		it("should update user", async () => {
			const res = await supertest(app.getHttpServer())
				.put(`/api/users/${dbUser.id}`)
				.send({ firstName: "NewName" })
				.auth(adminUser.email, "password")

			expect(res.statusCode).toEqual(200)
			expect(res.body.data).toMatchObject({ id: dbUser.id, firstName: "NewName" })
			const inDb = await usersService.findUser({ id: dbUser.id })
			expect(inDb).toEqual({ ...dbUser, firstName: "NewName" })
		})
	})
})
