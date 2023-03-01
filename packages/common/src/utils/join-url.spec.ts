import { joinUrl } from "./join-url"

import { describe, expect, it } from "vitest"

/**
 *
 */
describe("joinUrl", () => {
	it("should join parts of url", () => {
		expect(joinUrl("hello", "world")).toBe("hello/world")
		expect(joinUrl("http://example.com", "world")).toBe("http://example.com/world")
		expect(joinUrl("http://example.com", "world", "test?me=true")).toBe(
			"http://example.com/world/test?me=true",
		)
	})
	// https://github.com/jfromaniello/url-join/issues/40
	it("should handle double /", () => {
		expect(joinUrl("http://example.com", "api/", "/", "/world")).toBe(
			"http://example.com/api/world",
		)
	})

	it("should will consistently remove trailing slash /", () => {
		expect(joinUrl("http://example.com/api/")).toBe("http://example.com/api/")
		expect(joinUrl("http://example.com/api")).toBe("http://example.com/api")
		expect(joinUrl("http://example.com/api/", "#hello")).toBe("http://example.com/api#hello")
		expect(joinUrl("http://example.com/api", "#hello")).toBe("http://example.com/api#hello")
	})
})
