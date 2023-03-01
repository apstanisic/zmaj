import { RepoManager } from "@api/database/orm-specs/RepoManager"
import { KeyValueStorageService } from "@api/key-value-storage/key-value-storage.service"
import { SettingsKey } from "@api/key-value-storage/key-value.consts"
import { getE2ETestModule } from "@api/testing/e2e-test-module"
import { UsersService } from "@api/users/users.service"
import { INestApplication } from "@nestjs/common"
import { ADMIN_ROLE_ID, SignUpDto, UserCollection, uuidRegex } from "@zmaj-js/common"
import supertest from "supertest"
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	SpyInstance,
	vi,
} from "vitest"

describe("InitializeAdminController e2e", () => {
	let app: INestApplication
	let usersService: UsersService

	// we have to spy, since we are using same app for all tests, and we can't be sure
	// about count, since tests in other files are ran in parallel
	let spyCount: SpyInstance

	beforeAll(async () => {
		app = await getE2ETestModule({
			authentication: { allowBasicAuth: true, allowAdminInitialize: true },
		})
		usersService = app.get(UsersService)
	})

	afterAll(async () => {
		await app.close()
	})

	beforeEach(() => {
		spyCount = vi.spyOn(usersService.repo, "count")
	})

	afterEach(() => {
		spyCount.mockRestore()
	})

	it("should be defined", () => {
		expect(app).toBeDefined()
	})
	/* No more this endpoint */
	// describe("GET /auth/initialize-admin/is-initialized", () => {
	// 	beforeEach(async () => {
	// 		spyCount.mockResolvedValue(1)
	// 	})

	// 	it("should return status", async () => {
	// 		const res = await supertest(app.getHttpServer()).get(
	// 			"/api/auth/initialize-admin/is-initialized",
	// 		)
	// 		expect(res.statusCode).toEqual(200)
	// 		expect(res.body).toEqual({ initialized: true })
	// 	})
	// })

	describe("POST /auth/initialize-admin", () => {
		beforeEach(async () => {
			spyCount.mockResolvedValue(0)
			await app
				.get(KeyValueStorageService)
				.delete(SettingsKey.ADMIN_USER_INITED, SettingsKey.NAMESPACE)
			await app
				.get(RepoManager)
				.getRepo(UserCollection)
				.deleteWhere({ where: { roleId: ADMIN_ROLE_ID } })
		})

		it("should create admin user", async () => {
			const res = await supertest(app.getHttpServer())
				.post("/api/auth/initialize-admin")
				.send(new SignUpDto({ email: "test@example.com", password: "password" }))

			expect(res.statusCode).toEqual(201)
			expect(res.body).toEqual({
				email: "test@example.com",
				roleId: ADMIN_ROLE_ID,
				userId: expect.stringMatching(uuidRegex),
			})
		})
	})
})
