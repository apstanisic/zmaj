import { objectLength } from "./object-length"

import { it, expect, describe } from "vitest"

describe("objectLength", () => {
	it("should get amount of properties of an object", () => {
		expect(objectLength({ id: 5, name: 1 })).toEqual(2)
		expect(objectLength({})).toEqual(0)
		expect(objectLength({ name: { some: "value", hello: "world" } })).toEqual(1)
	})
})
