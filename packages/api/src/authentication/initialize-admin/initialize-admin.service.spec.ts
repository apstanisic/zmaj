import { KeyValueStorageService } from "@api/key-value-storage/key-value-storage.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { UsersService } from "@api/users/users.service"
import { ForbiddenException, Logger } from "@nestjs/common"
import {
	ADMIN_ROLE_ID,
	AuthUser,
	SignUpDto,
	User,
	UserModel,
	asMock,
	makeWritable,
} from "@zmaj-js/common"
import { RepoManager } from "@zmaj-js/orm"
import { SignUpDtoStub, UserStub } from "@zmaj-js/test-utils"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthenticationConfig } from "../authentication.config"
import { InitializeAdminService } from "./initialize-admin.service"

describe("InitializeAdminService", () => {
	let service: InitializeAdminService
	let usersService: UsersService
	let keyValService: KeyValueStorageService
	let adminUser: User
	let authnConfig: AuthenticationConfig

	beforeEach(async () => {
		adminUser = UserStub()
		const module = await buildTestModule(InitializeAdminService).compile()
		service = module.get(InitializeAdminService)
		//
		keyValService = module.get(KeyValueStorageService)
		keyValService.findByKey = vi.fn()
		keyValService.updateOrCreate = vi.fn()
		//
		authnConfig = module.get(AuthenticationConfig)
		authnConfig.allowAdminInitialize = true
		//
		usersService = module.get(UsersService)
		makeWritable(usersService).repo = module.get(RepoManager).getRepo(UserModel)
		// usersService.repo = module.get(RepoManager).getRepo(UserCollection)
		usersService.createUser = vi.fn(async () => adminUser)
	})

	it("should be defined", () => {
		expect(service).toBeInstanceOf(InitializeAdminService)
	})
	/**
	 *
	 */
	describe("isAdminInitialized", () => {
		beforeEach(() => {
			usersService.repo.count = vi.fn(async () => 0)
		})

		// I'm not exposing this at all anymore
		// it("should throw if info is not allowed to be exposed", async () => {
		// 	authnConfig.allowAdminInitialize = false
		// 	await expect(service.isAdminInitialized()).rejects.toThrow(ForbiddenException)
		// })

		it("should return true if there is user with admin role", async () => {
			asMock(usersService.repo.count).mockResolvedValue(1)

			const res = await service.isAdminInitialized()

			expect(res).toBe(true)
			expect(usersService.repo.count).toBeCalledWith({ where: { roleId: ADMIN_ROLE_ID } })
		})

		it("should return true if there is flag is key val store that it exist", async () => {
			asMock(keyValService.findByKey).mockResolvedValue({ value: "true" })

			const res = await service.isAdminInitialized()

			expect(res).toBe(true)
			expect(keyValService.findByKey).toBeCalledWith("ADMIN_USER_INITED", "settings")
		})

		it("should return false if there is no admin in db, and flag is not set", async () => {
			asMock(keyValService.findByKey).mockResolvedValue(undefined)
			const res = await service.isAdminInitialized()
			expect(res).toBe(false)
		})
	})

	describe("onApplicationBootstrap", () => {
		beforeEach(() => {
			service.logger = new Logger()
			service.logger.log = vi.fn()
			service["config"].allowAdminInitialize = false
		})
		it("do nothing if admin inited", async () => {
			service.isAdminInitialized = vi.fn(async () => true)
			await service.onApplicationBootstrap()
			expect(service.logger.log).not.toBeCalled()
			//
		})
		it("should print instructions to create admin if not inited", async () => {
			service.isAdminInitialized = vi.fn(async () => false)
			await service.onApplicationBootstrap()
			expect(service.logger.log).toBeCalledWith(expect.stringContaining("npx zmaj create-admin"))
			expect(service.logger.log).not.toBeCalledWith(expect.stringContaining("/auth/init"))
		})

		it("should print instructions to create admin if not inited", async () => {
			service.isAdminInitialized = vi.fn(async () => false)
			service["config"].allowAdminInitialize = true
			await service.onApplicationBootstrap()
			expect(service.logger.log).toBeCalledWith(expect.stringContaining("/auth/init"))
		})
	})

	describe("createAdminSafe", () => {
		let dto: SignUpDto

		beforeEach(() => {
			dto = SignUpDtoStub()
			service.isAdminInitialized = vi.fn().mockResolvedValue(false)
		})

		it("should throw if admin not allowed to init", async () => {
			service["config"].allowAdminInitialize = false
			asMock(service.isAdminInitialized).mockResolvedValue(true)
			await expect(service.createAdminSafe(dto)).rejects.toThrow(ForbiddenException)
		})

		it("should throw if admin is already initialized", async () => {
			asMock(service.isAdminInitialized).mockResolvedValue(true)
			await expect(service.createAdminSafe(dto)).rejects.toThrow(ForbiddenException)
		})
	})
	/**
	 *
	 */
	describe("createAdmin", () => {
		let dto: SignUpDto

		beforeEach(() => {
			dto = SignUpDtoStub()
			service.isAdminInitialized = vi.fn().mockResolvedValue(false)
		})

		it("should create user", async () => {
			const { password, ...rest } = dto
			await service.createAdmin(dto)
			expect(usersService.createUser).toBeCalledWith({
				// id: MAIN_ADMIN_ID,
				data: {
					...rest,
					roleId: ADMIN_ROLE_ID,
					password,
					status: "active",
					confirmedEmail: true,
				},
				trx: "TEST_TRX",
			})
		})

		it("create flag in db", async () => {
			await service.createAdmin(dto)
			expect(keyValService.updateOrCreate).toBeCalledWith(
				{
					key: "ADMIN_USER_INITED",
					value: "true",
					namespace: "settings",
				},
				"TEST_TRX",
			)
		})

		it("should return created user", async () => {
			const res = await service.createAdmin(dto)
			expect(res).toEqual(AuthUser.fromUser(adminUser))
		})
	})
})
