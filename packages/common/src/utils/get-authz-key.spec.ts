import { getAuthzKey } from "./get-authz-key"

import { it, expect, describe } from "vitest"

describe("getAuthzKey", () => {
	it("should get proper key for non system tables", () => {
		expect(getAuthzKey("posts")).toEqual("collections.posts")
		expect(getAuthzKey("myComments")).toEqual("collections.myComments")
		// expect(getAuthzKey("with_camel")).toEqual("collections.withCamel")
	})

	it("should throw for system collection", () => {
		expect(() => getAuthzKey("zmajUsers")).toThrow()
		expect(() => getAuthzKey("zmaj_roles")).toThrow()
	})
	// it("should get proper key for system tables", () => {
	// 	expect(getAuthzKey("zmaj_roles")).toEqual("zmaj.roles")
	// 	expect(getAuthzKey("zmajUsers")).toEqual("collections.users")
	// })
})
