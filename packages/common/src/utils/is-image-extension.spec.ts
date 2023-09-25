import { isImageExtensionFileName } from "./is-image-extension"

import { describe, expect, it } from "vitest"

describe("isImageExtension", () => {
	it("should return true if image", () => {
		expect(isImageExtensionFileName("test.jpeg")).toBe(true)
		expect(isImageExtensionFileName("test.jpg")).toBe(true)
		expect(isImageExtensionFileName("test.png")).toBe(true)
		expect(isImageExtensionFileName("test.pdf")).toBe(false)
	})
})
