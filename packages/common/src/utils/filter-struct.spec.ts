import { filterStruct } from "./filter-struct"

import { it, expect, describe } from "vitest"

describe("filterStruct", () => {
	const struct = {
		id: 5,
		name: "test",
		someVal: "hello world",
		bool: false,
	}

	it("should filter struct", () => {
		//
		const res = filterStruct(struct, (value) => typeof value === "string")
		expect(res).toEqual({ name: "test", someVal: "hello world" })
	})

	it("can filter by key", () => {
		const res = filterStruct(struct, (value, key) => key === "id")
		expect(res).toEqual({ id: 5 })
	})
})
