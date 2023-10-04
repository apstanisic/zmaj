import { EncryptionService } from "@api/encryption/encryption.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { BadRequestException, ForbiddenException, UnauthorizedException } from "@nestjs/common"
import { TestingModule } from "@nestjs/testing"
import { randEmail } from "@ngneat/falso"
import { AuthUser, User, UserCreateDto, UserUpdatePasswordDto, asMock } from "@zmaj-js/common"
import { AuthUserStub, UserStub } from "@zmaj-js/test-utils"
import { v4 } from "uuid"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ZodError } from "zod"
import { UsersService } from "./users.service"

describe("UsersService", () => {
	let module: TestingModule
	let service: UsersService
	let encService: EncryptionService

	let user: User

	beforeEach(async () => {
		module = await buildTestModule(UsersService).compile()

		user = UserStub({ confirmedEmail: true, status: "active" })
		//
		service = module.get(UsersService)
		encService = module.get(EncryptionService)
		encService.hash = vi.fn(async () => "hash-password")
	})

	it("should be defined", () => {
		expect(service).toBeInstanceOf(UsersService)
	})

	/**
	 *
	 */
	describe("findUser", () => {
		beforeEach(() => {
			service["repo"].findOne = vi.fn(async () => user as any)
		})

		it("should find user", async () => {
			const res = await service.findUser({ email: "test" }, "trx" as any)
			expect(service["repo"].findOne).toBeCalledWith({ where: { email: "test" }, trx: "trx" })
			expect(res).toEqual(user)
		})

		it("should return undefined if user does not exist", async () => {
			asMock(service["repo"].findOne).mockImplementation(async () => undefined)
			const res = await service.findUser({ id: "some-id" })
			expect(res).toEqual(undefined)
		})
	})

	/**
	 *
	 */
	describe("findActiveUser", () => {
		beforeEach(() => {
			service.findUser = vi.fn(async () => user)
		})

		it("should throw if user does not exist", async () => {
			asMock(service.findUser).mockImplementation(async () => undefined)
			await expect(service.findActiveUser({ email: "test" })).rejects.toThrow(
				UnauthorizedException,
			)
		})

		it("should throw if user is not active", async () => {
			user.status = "disabled"
			await expect(service.findActiveUser({ email: "test" })).rejects.toThrow(
				ForbiddenException,
			)
		})

		it("should return active user", async () => {
			user.status = "active"
			const res = await service.findActiveUser({ email: "test" })
			expect(res).toEqual(user)
		})
	})

	/**
	 *
	 */
	describe("createUser", () => {
		let encryptionService: EncryptionService
		beforeEach(() => {
			service["repo"].createOne = vi.fn().mockImplementation(async () => user)
			encryptionService = module.get(EncryptionService)
			encryptionService.hash = vi.fn(async (val) => `${val}_hashed`)
		})

		it("should validate input data", async () => {
			await expect(
				service.createUser({ data: { ...user, status: "hello" as any } }),
			).rejects.toThrow(ZodError)

			await expect(
				service.createUser({
					data: {
						...new UserCreateDto({ email: randEmail() }),
						roleId: "non-uuid",
						password: "valid_password",
					},
				}),
			).rejects.toThrow(ZodError)
		})

		it("should save hashed password in db", async () => {
			await service.createUser({
				data: new UserCreateDto({
					...user,
					password: "secret_pass",
				}),
			})
			expect(service["repo"].createOne).toBeCalledWith({
				data: expect.objectContaining({
					password: expect.stringMatching("secret_pass_hashed"),
				}),
			})
		})

		it("should return saved user", async () => {
			const result = await service.createUser({
				data: new UserCreateDto({ email: randEmail(), roleId: v4() }),
			})
			expect(result).toEqual(user)
		})
	})

	/**
	 *
	 */
	describe("updateUser", () => {
		beforeEach(() => {
			service["repo"].updateById = vi.fn().mockImplementation(async () => user)
		})

		it("should update user", async () => {
			await service.updateUser({ userId: "1", data: { firstName: "test" } })
			expect(service["repo"].updateById).toBeCalledWith({
				id: "1",
				changes: { firstName: "test" },
			})
		})

		it("should update user", async () => {
			const res = await service.updateUser({ userId: "1", data: { firstName: "test" } })
			expect(res).toEqual(user)
		})
	})

	describe("setPassword", () => {
		beforeEach(() => {
			encService.hash = vi.fn(async (pass: string) => `${pass}_hash`)
			service["orm"].rawQuery = vi.fn(async () => [])
			service.repo.updateWhere = vi.fn()
		})

		it("should throw if user provided invalid password", async () => {
			encService.hash = vi.fn().mockRejectedValue(new BadRequestException(47999))
			await expect(
				service.setPassword({ userId: "uid", newPassword: "hello" }),
			).rejects.toThrow(BadRequestException)
		})

		it("should generate password hash", async () => {
			await service.setPassword({ userId: "uid", newPassword: "hello world" })
			expect(encService.hash).toBeCalledWith("hello world")
		})

		it("should save hashed password", async () => {
			const trx = "my_trx" as any
			await service.setPassword({ userId: "user_id_value", newPassword: "helloworld", trx })
			expect(service.repo.updateWhere).toBeCalledWith({
				changes: { password: "helloworld_hash" },
				where: "user_id_value",
				trx,
				overrideCanUpdate: true,
			})
		})
	})

	/**
	 *
	 */
	describe("checkPassword", () => {
		beforeEach(() => {
			encService.verifyHash = vi.fn(async () => true)
			service.findUserWithHiddenFields = vi.fn(async () => UserStub())
		})
		it("should return false if user does not exist", async () => {
			service.findUserWithHiddenFields = vi.fn(async () => undefined)
			const res = await service.checkPassword({ userId: "id", password: "password" })
			expect(res).toBe(false)
		})

		it("should return true if password is valid", async () => {
			const result = await service.checkPassword({ userId: "id", password: "password" })
			expect(result).toBe(true)
		})

		it("should return false if password is invalid", async () => {
			encService.verifyHash = vi.fn(async () => false)
			const result = await service.checkPassword({ userId: "id", password: "password" })
			expect(result).toBe(false)
		})
	})

	/**
	 *
	 */
	describe("tryChangePassword", () => {
		let user: AuthUser
		beforeEach(() => {
			user = AuthUserStub()

			service.checkPassword = vi.fn(async () => true)
			service.setPassword = vi.fn(async () => undefined)
		})
		it("should throw if password is invalid", async () => {
			asMock(service.checkPassword).mockRejectedValue(new BadRequestException())
			await expect(
				service.tryChangePassword({
					user,
					data: new UserUpdatePasswordDto({
						newPassword: "qwerty123",
						oldPassword: "password",
					}),
				}),
			).rejects.toThrow(BadRequestException)
		})

		it("should set password if valid", async () => {
			await service.tryChangePassword({
				user,
				data: {
					oldPassword: "old_password",
					newPassword: "new_password",
				},
			})
			expect(service.setPassword).toBeCalledWith({
				userId: user.userId,
				newPassword: "new_password",
			})
		})
	})
})
