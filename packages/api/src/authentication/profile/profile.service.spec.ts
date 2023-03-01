import { AuthorizationService } from "@api/authorization/authorization.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { UsersService } from "@api/users/users.service"
import { ForbiddenException } from "@nestjs/common"
import { TestingModule } from "@nestjs/testing"
import { randPassword } from "@ngneat/falso"
import { asMock, AuthUser, User, UserUpdatePasswordDto } from "@zmaj-js/common"
import { UserStub } from "@zmaj-js/test-utils"
import { pick } from "radash"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ProfileService } from "./profile.service"

describe("ProfileService", () => {
	let module: TestingModule
	let service: ProfileService
	let usersService: UsersService
	let authzService: AuthorizationService

	let authUser: AuthUser
	let fullUser: User

	beforeEach(async () => {
		module = await buildTestModule(ProfileService).compile()

		fullUser = UserStub()
		authUser = AuthUser.fromUser(fullUser)

		service = module.get(ProfileService)
		//
		authzService = module.get(AuthorizationService)
		authzService.checkSystem = vi.fn(() => true)
		//
		usersService = module.get(UsersService)
		usersService.tryChangePassword = vi.fn()
		usersService.updateUser = vi.fn().mockImplementation(async () => fullUser)
		usersService.findActiveUser = vi.fn(async () => fullUser)
	})

	it("should compile", () => {
		expect(service).toBeInstanceOf(ProfileService)
	})

	/**
	 *
	 */
	describe("getProfile", () => {
		it("should get only active users", async () => {
			await service.getProfile(authUser)
			expect(usersService.findActiveUser).toBeCalledWith({ id: authUser.userId })
		})
		it("should throw if user can not read profile info", async () => {
			asMock(authzService.checkSystem).mockImplementation(() => false)
			await expect(service.getProfile(authUser)).rejects.toThrow(ForbiddenException)
		})

		it("should only return profile fields", async () => {
			const res = await service.getProfile(authUser)
			expect(res).toEqual(pick(fullUser, ["id", "email", "firstName", "lastName"]))
		})
	})

	/**
	 *
	 */
	describe("updateInfo", () => {
		it("should throw if user is not allowed", async () => {
			const data = { firstName: "NewName" }
			asMock(authzService.checkSystem).mockImplementation(() => false)
			await expect(service.updateInfo({ data, user: authUser })).rejects.toThrow(ForbiddenException)
		})

		it("should update user info", async () => {
			await service.updateInfo({ user: authUser, data: { firstName: "test" } })
			expect(service["usersService"].updateUser).toBeCalledWith({
				userId: authUser.userId, //
				data: { firstName: "test" },
			})
		})

		it("should only return profile fields", async () => {
			const res = await service.updateInfo({ user: authUser, data: {} })
			expect(res).toEqual(pick(fullUser, ["id", "email", "firstName", "lastName"]))
		})
	})

	/**
	 *
	 */
	describe("changePassword", () => {
		const dto = new UserUpdatePasswordDto({
			newPassword: randPassword(),
			oldPassword: randPassword(),
		})

		it("should throw if user is not allowed", async () => {
			asMock(authzService.checkSystem).mockImplementation(() => false)
			await expect(service.changePassword(authUser, dto)).rejects.toThrow(ForbiddenException)
		})

		it("should update user password", async () => {
			await service.changePassword(authUser, dto)
			expect(usersService.tryChangePassword).toBeCalledWith({ user: authUser, data: dto })
		})
	})
})
