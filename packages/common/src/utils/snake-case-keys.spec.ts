import { snakeCaseKeys } from "./snake-case-keys"

import { it, expect, describe } from "vitest"

describe("snakeCaseKeys", () => {
	it("should snake case keys", () => {
		expect(snakeCaseKeys({ valOne: 1, valTwo2: 2 })).toEqual({ val_one: 1, val_two_2: 2 })
	})
})
