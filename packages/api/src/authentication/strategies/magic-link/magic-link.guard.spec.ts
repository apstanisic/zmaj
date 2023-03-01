import { describe, expect, it } from "vitest"
import { MagicLinkGuard } from "./magic-link.guard"

describe("MagicLinkGuard", () => {
	it("should be defined", () => {
		expect(new MagicLinkGuard()).toBeInstanceOf(MagicLinkGuard)
	})
})
