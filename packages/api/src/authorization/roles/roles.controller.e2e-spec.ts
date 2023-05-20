import { getE2ETestModuleExpanded, TestBundle } from "@api/testing/e2e-test-module"
import { fixTestDate } from "@api/testing/stringify-date"
import { INestApplication } from "@nestjs/common"
import {
	qsStringify,
	Role,
	RoleCreateDto,
	RoleModel,
	RoleSchema,
	times,
	User,
	zodCreate,
} from "@zmaj-js/common"
import { OrmRepository, RepoManager } from "@zmaj-js/orm"
import supertest from "supertest"
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest"

describe("RoleController e2e", () => {
	let all: TestBundle
	let app: INestApplication
	let repo: OrmRepository<RoleModel>
	let user: User
	//
	beforeAll(async () => {
		all = await getE2ETestModuleExpanded()
		app = all.app
		repo = app.get(RepoManager).getRepo(RoleModel)
		user = await all.createUser()
	})
	afterAll(async () => {
		all.deleteUser(user)
		await app.close()
	})

	it("should compile", () => {
		expect(app).toBeDefined()
	})

	describe("GET /", () => {
		beforeEach(async () => {
			await repo.deleteWhere({ where: { name: { $like: "test_get_role_xx_%" } } })
			await repo.createMany({
				data: times(15, (i) =>
					zodCreate(RoleSchema.omit({ createdAt: true }), { name: `test_get_role_xx_${i}` }),
				),
			})
		})
		afterEach(async () => {
			await repo.deleteWhere({ where: { name: { $like: "test_get_role_xx_%" } } })
		})

		it("should get roles", async () => {
			const query = qsStringify({
				limit: 10,
				count: true,
				filter: { name: { $like: "test_get_role_xx_%" } },
			})

			const res = await supertest(app.getHttpServer())
				.get(`/api/system/roles?${query}`)
				.auth(user.email, "password")

			expect(res.statusCode).toEqual(200)
			expect(res.body.data).toHaveLength(10)
			expect(res.body.count).toBe(15)
		})
	})

	describe("GET /:id", () => {
		let role: Role
		beforeEach(async () => {
			await repo.deleteWhere({ where: { name: "test_get_id" } })
			role = await repo.createOne({
				data: zodCreate(RoleSchema.omit({ createdAt: true }), { name: "test_get_id" }),
			})
		})
		afterEach(async () => {
			await repo.deleteWhere({ where: { name: "test_get_id" } })
		})

		it("should get role", async () => {
			const res = await supertest(app.getHttpServer())
				.get(`/api/system/roles/${role.id}`)
				.auth(user.email, "password")

			expect(res.statusCode).toEqual(200)
			expect(res.body.data).toMatchObject(fixTestDate(role))
		})
	})

	describe("POST /", () => {
		beforeEach(async () => {
			await repo.deleteWhere({ where: { name: "test_123" } })
		})
		afterEach(async () => {
			await repo.deleteWhere({ where: { name: "test_123" } })
		})

		it("should create role", async () => {
			const dto = new RoleCreateDto({ name: "test_123", description: "This is DESC" })
			const res = await supertest(app.getHttpServer())
				.post("/api/system/roles")
				.auth(user.email, "password")
				.send(dto)

			expect(res.statusCode).toEqual(201)
			expect(res.body.data).toMatchObject({ name: dto.name })
			await expect(repo.findOne({ where: { name: dto.name } })).resolves.toMatchObject({
				name: dto.name,
				description: dto.description,
			})
		})
	})

	describe("PUT /:id", () => {
		let role: Role
		beforeEach(async () => {
			await repo.deleteWhere({ where: { name: "test_update_role" } })
			const roleDto = zodCreate(RoleSchema.omit({ createdAt: true }), {
				name: "test_update_role",
				description: "og_desc",
			})
			role = await repo.createOne({ data: roleDto })
		})
		afterEach(async () => {
			await repo.deleteWhere({ where: { name: "test_update_role" } })
		})

		it("should update role", async () => {
			const res = await supertest(app.getHttpServer())
				.put(`/api/system/roles/${role.id}`)
				.auth(user.email, "password")
				.send({ description: "new_desc" })

			const roleInDb = await repo.findOne({ where: { id: role.id } })

			expect(roleInDb?.description).toEqual("new_desc")
			expect(res.statusCode).toEqual(200)
			expect(res.body.data).toMatchObject({ description: "new_desc" })
		})
	})

	describe("DELETE /:id", () => {
		beforeEach(async () => {
			await repo.deleteWhere({ where: { name: "test_update_role" } })
		})
		afterEach(async () => {
			await repo.deleteWhere({ where: { name: "test_delete_id" } })
		})

		it("should delete role", async () => {
			const role = await repo.createOne({
				data: zodCreate(RoleSchema.omit({ createdAt: true }), { name: "test_delete_id" }),
			})
			const res = await supertest(app.getHttpServer())
				.delete(`/api/system/roles/${role.id}`)
				.auth(user.email, "password")

			const roleInDb = await repo.findOne({ where: { id: role.id } })

			expect(roleInDb).toEqual(undefined)
			expect(res.statusCode).toEqual(200)
			expect(res.body.data).toMatchObject(fixTestDate(role))
		})
	})
})
