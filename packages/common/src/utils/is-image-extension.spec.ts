import { isImageExtension } from "./is-image-extension"

import { it, expect, describe } from "vitest"

describe("isImageExtension", () => {
	it("should return true if image", () => {
		expect(isImageExtension("jpeg")).toBe(true)
		expect(isImageExtension("jpg")).toBe(true)
		expect(isImageExtension("png")).toBe(true)
		expect(isImageExtension("pdf")).toBe(false)
		expect(isImageExtension(null)).toBe(false)
		expect(isImageExtension(undefined)).toBe(false)
	})
})
