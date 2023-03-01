import { PUBLIC_ROLE_ID } from "@zmaj-js/common"
import { AuthUserStub } from "@zmaj-js/test-utils"
import { describe, expect, it } from "vitest"
import { currentRoleTransformer } from "./current-role.transformer"

describe("currentRoleTransformer", () => {
	it("should have key named CURRENT_ROLE", () => {
		expect(currentRoleTransformer.key).toBe("CURRENT_ROLE")
	})

	describe("transform", () => {
		it("should return user role when user is logged in", () => {
			const user = AuthUserStub()
			const roleId = currentRoleTransformer.transform({ user })
			expect(roleId).toBe(user.roleId)
		})

		it("should return public role when user is not logged in", () => {
			const roleId = currentRoleTransformer.transform({})
			expect(roleId).toBe(PUBLIC_ROLE_ID)
		})
	})
})
