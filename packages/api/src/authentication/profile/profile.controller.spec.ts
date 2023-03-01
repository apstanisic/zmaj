import { buildTestModule } from "@api/testing/build-test-module"
import { randPassword } from "@ngneat/falso"
import { asMock, AuthUser, User, UserUpdatePasswordDto } from "@zmaj-js/common"
import { UserStub } from "@zmaj-js/test-utils"
import { pick } from "radash"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ProfileController } from "./profile.controller"
import { ProfileService } from "./profile.service"

describe("ProfileController", () => {
	let controller: ProfileController
	let service: ProfileService
	let user: AuthUser
	let fullUser: User

	beforeEach(async () => {
		fullUser = UserStub()
		user = AuthUser.fromUser(fullUser)

		const module = await buildTestModule(ProfileController).compile()

		controller = module.get(ProfileController)
		service = module.get(ProfileService)
		service.updateInfo = vi.fn(async () => {
			return {
				...pick(fullUser, ["email", "id", "firstName", "lastName"]),
				hasOtp: fullUser.otpToken !== null,
			}
		})
		service.changePassword = vi.fn(async () => undefined)
		service.getProfile = vi.fn().mockImplementation(async () => user)
		controller = module.get(ProfileController)
	})

	/**
	 *
	 */
	describe("getProfile", () => {
		it("should get profile", async () => {
			asMock(service.getProfile).mockResolvedValue("test_user")
			const res = await controller.profileInfo(user)
			expect(service.getProfile).toBeCalledWith(user)
			expect(res).toEqual({ data: "test_user" })
		})
	})

	/**
	 *
	 */
	describe("updateInfo", () => {
		it("should update user data", async () => {
			await controller.updateInfo(user, { firstName: "test" })
			expect(controller["service"].updateInfo).toBeCalledWith({ user, data: { firstName: "test" } })
		})

		it("should return user email on success", async () => {
			asMock(service.updateInfo).mockResolvedValue("updated_user_profile")

			const res = await controller.updateInfo(user, {})
			expect(res).toEqual({ data: "updated_user_profile" })
		})
	})

	/**
	 *
	 */
	describe("changePassword", () => {
		let dto: UserUpdatePasswordDto
		beforeEach(() => {
			dto = new UserUpdatePasswordDto({ newPassword: randPassword(), oldPassword: randPassword() })
		})

		it("should change user password", async () => {
			await controller.changePassword(user, dto)
			expect(controller["service"].changePassword).toBeCalledWith(user, dto)
		})

		it("should return user email on success", async () => {
			const res = await controller.changePassword(user, dto)
			expect(res).toEqual({ email: user.email })
		})
	})
})
