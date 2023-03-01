import { camelCaseKeys } from "./camel-case-keys"

import { it, expect, describe } from "vitest"

describe("camelCaseKeys", () => {
	it("should camel case keys", () => {
		expect(camelCaseKeys({ val_one: 1, VAL_TWO_2: 2 })).toEqual({ valOne: 1, valTwo2: 2 })
	})
})
