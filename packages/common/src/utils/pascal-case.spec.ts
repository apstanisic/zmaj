import { pascalCase } from "./pascal-case"

import { it, expect, describe } from "vitest"

describe("pascalCase", () => {
	it("should convert value to pascal case", () => {
		expect(pascalCase("helloWorld")).toBe("HelloWorld")
		expect(pascalCase("hello_world")).toBe("HelloWorld")
		expect(pascalCase("Test_me_1")).toBe("TestMe1")
	})
})
