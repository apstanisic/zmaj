import { v4 } from "uuid"
import { isUUID } from "./is-uuid"

import { it, expect, describe } from "vitest"

describe("isUUID", () => {
	it("should return `true` if value is valid uuid", () => {
		//
		expect(isUUID(v4())).toBe(true)
		expect(isUUID("ae315113-8e49-4722-8b6d-2e8518d9328f")).toBe(true)
		expect(isUUID("non-value-value")).toBe(false)
	})
})
