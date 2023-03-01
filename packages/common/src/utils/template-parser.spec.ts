import { templateParser } from "./template-parser"

import { it, expect, describe } from "vitest"

describe("templateParser", () => {
	it("should parse properly", () => {
		const parsed = templateParser.parse("hello {name}", { name: "world" })
		expect(parsed).toBe("hello world")
	})
	it("should apply pipes", () => {
		const parsed = templateParser.parse("hello {name|upperCase}", { name: "world" })
		expect(parsed).toBe("hello WORLD")
	})

	it("should should apply multiple transformations", () => {
		const parsed = templateParser.parse("hello {first|upperCase} {last|lowerCase}", {
			first: "First",
			last: "Last",
		})
		expect(parsed).toBe("hello FIRST last")
	})

	it("should replace with empty string if value is nil", () => {
		const parsed = templateParser.parse("hello {name} 1", {})
		expect(parsed).toBe("hello  1")
	})

	it("should trim result replace with empty string if value is nil", () => {
		const parsed = templateParser.parse("  hello ", {})
		expect(parsed).toBe("hello")
	})
})
