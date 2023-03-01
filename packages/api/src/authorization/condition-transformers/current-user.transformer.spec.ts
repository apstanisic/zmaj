import { isUUID } from "@zmaj-js/common"
import { AuthUserStub } from "@zmaj-js/test-utils"
import { unique } from "radash"
import { describe, expect, it } from "vitest"
import { currentUserTransformer } from "./current-user.transformer"

describe("currentUserTransformer", () => {
	it("should have key named CURRENT_USER", () => {
		expect(currentUserTransformer.key).toBe("CURRENT_USER")
	})

	describe("transform", () => {
		it("should return user id when user is logged in", () => {
			const user = AuthUserStub()
			const userId = currentUserTransformer.transform({ user })
			expect(userId).toBe(user.userId)
		})

		it("should return random uuid so comparison is always false", () => {
			const id1 = currentUserTransformer.transform({})
			const id2 = currentUserTransformer.transform({})
			const id3 = currentUserTransformer.transform({})

			expect(isUUID(id1)).toBe(true)
			expect(isUUID(id2)).toBe(true)
			expect(isUUID(id3)).toBe(true)
			// every value should be unique
			expect(unique([id1, id2, id3])).toHaveLength(3)
		})
	})
})
