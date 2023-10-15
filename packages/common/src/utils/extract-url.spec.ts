import { describe, expect, it } from "vitest"
import { extractUrl } from "./extract-url"

describe("extractUrl", () => {
	it("should extract url from text", () => {
		expect(
			extractUrl("Hello World I am http://www.google.com/test?example=world in the middle"),
		).toEqual("http://www.google.com/test?example=world")
		expect(extractUrl("http://www.google.com/test?example=world in the middle")).toEqual(
			"http://www.google.com/test?example=world",
		)
		expect(extractUrl("Start text - http://www.google.com/test?example=world")).toEqual(
			"http://www.google.com/test?example=world",
		)
		expect(extractUrl("Start text - http://www.google.com")).toEqual("http://www.google.com")
	})
})
