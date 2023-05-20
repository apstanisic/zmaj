import { TestBundle, getE2ETestModuleExpanded } from "@api/testing/e2e-test-module"
import { fixTestDate } from "@api/testing/stringify-date"
import { INestApplication } from "@nestjs/common"
import {
	PUBLIC_ROLE_ID,
	Permission,
	PermissionCreateDto,
	PermissionModel,
	PermissionSchema,
	User,
	qsStringify,
	times,
	zodCreate,
} from "@zmaj-js/common"
import { OrmRepository, RepoManager } from "@zmaj-js/orm"
import supertest from "supertest"
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest"

describe("PermissionController e2e", () => {
	let all: TestBundle
	let app: INestApplication
	let repo: OrmRepository<PermissionModel>

	let user: User

	//
	beforeAll(async () => {
		all = await getE2ETestModuleExpanded()
		app = all.app
		repo = app.get(RepoManager).getRepo(PermissionModel)

		user = await all.createUser()
	})
	afterAll(async () => {
		await all.deleteUser(user)
		await app.close()
	})

	describe("POST /", () => {
		beforeEach(async () => {
			await repo.deleteWhere({ where: { resource: "super_resource_post" } })
		})

		afterEach(async () => {
			await repo.deleteWhere({ where: { resource: "super_resource_post" } })
		})

		it("should create Permission", async () => {
			const dto = new PermissionCreateDto({
				roleId: PUBLIC_ROLE_ID,
				action: "read",
				resource: "super_resource_post",
			})
			const res = await supertest(app.getHttpServer())
				.post("/api/system/permissions")
				.auth(user.email, "password")
				.send(dto)

			expect(res.statusCode).toEqual(201)
			expect(res.body.data).toMatchObject(dto)
			await expect(repo.findById({ id: res.body.data.id })).resolves.toMatchObject(dto)
		})
	})

	describe("GET /:id", () => {
		let permission: Permission
		beforeEach(async () => {
			permission = await repo.createOne({
				data: zodCreate(PermissionSchema.omit({ createdAt: true }), {
					roleId: PUBLIC_ROLE_ID,
					action: "read",
					resource: "super_resource_get",
				}),
			})
		})
		afterEach(async () => {
			await repo.deleteWhere({ where: { resource: "super_resource_get" } })
		})

		it("should get Permission", async () => {
			const res = await supertest(app.getHttpServer())
				.get(`/api/system/permissions/${permission.id}`)
				.auth(user.email, "password")

			expect(res.statusCode).toEqual(200)
			expect(res.body.data).toMatchObject(fixTestDate(permission))
		})
	})

	describe("GET /", () => {
		beforeEach(async () => {
			await repo.deleteWhere({ where: { resource: { $like: "get_many_test_%" } } })
			await repo.createMany({
				data: times(15, (i) =>
					zodCreate(PermissionSchema.omit({ createdAt: true }), {
						action: "read",
						roleId: PUBLIC_ROLE_ID,
						resource: `get_many_test_${i}`,
					}),
				),
			})
		})

		afterEach(async () => {
			await repo.deleteWhere({ where: { resource: { $like: "get_many_test_%" } } })
		})

		it("should get Permissions", async () => {
			const query = qsStringify({
				limit: 10,
				count: true,
				filter: { resource: { $like: "get_many_test_%" } },
			})

			const res = await supertest(app.getHttpServer())
				.get(`/api/system/permissions?${query}`)
				.auth(user.email, "password")

			expect(res.statusCode).toEqual(200)
			expect(res.body.data).toHaveLength(10)
			expect(res.body.count).toBe(15)
		})
	})

	describe("DELETE /:id", () => {
		let permission: Permission
		beforeEach(async () => {
			await repo.deleteWhere({ where: { resource: "super_resource_delete" } })
			permission = await repo.createOne({
				data: zodCreate(PermissionSchema.omit({ createdAt: true }), {
					roleId: PUBLIC_ROLE_ID,
					action: "read",
					resource: "super_resource_delete",
				}),
			})
		})

		afterEach(async () => {
			await repo.deleteWhere({ where: { resource: "super_resource_delete" } })
		})

		it("should delete Permission", async () => {
			const res = await supertest(app.getHttpServer())
				.delete(`/api/system/permissions/${permission.id}`)
				.auth(user.email, "password")

			expect(res.statusCode).toEqual(200)
			expect(res.body.data).toMatchObject(fixTestDate(permission))

			const permissionInDb = await repo.findOne({ where: { id: permission.id } })
			expect(permissionInDb).toEqual(undefined)
		})
	})

	describe("PUT /:id", () => {
		let permission: Permission
		beforeEach(async () => {
			await repo.deleteWhere({ where: { resource: "super_resource_put" } })
			permission = await repo.createOne({
				data: zodCreate(PermissionSchema.omit({ createdAt: true }), {
					roleId: PUBLIC_ROLE_ID,
					action: "read",
					resource: "super_resource_put",
				}),
			})
		})

		afterEach(async () => {
			await repo.deleteWhere({ where: { resource: "super_resource_put" } })
		})

		it("should update Permission", async () => {
			const res = await supertest(app.getHttpServer())
				.put(`/api/system/permissions/${permission.id}`)
				.auth(user.email, "password")
				.send({ fields: ["hello", "world"] })

			expect(res.statusCode).toEqual(200)
			expect(res.body.data).toMatchObject({ fields: ["hello", "world"] })

			const permissionInDb = await repo.findOne({ where: { id: permission.id } })
			expect(permissionInDb?.fields).toEqual(["hello", "world"])
		})
	})
})
