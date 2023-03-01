import { describe, expect, it, vi } from "vitest"
import { asMock } from "./as-mock"
import { fromBase64 } from "./from-base-64"
import { getJwtContent } from "./get-jwt-content"
import { throwErr } from "./throw-err"

vi.mock("./from-base-64", () => ({
	fromBase64: vi.fn(() => JSON.stringify({ hello: "world" })),
}))

describe("getJwtContent", () => {
	/**
	 *
	 */
	it("should get jwt content", () => {
		const res = getJwtContent("mock.jwt.content")
		expect(res).toEqual({ hello: "world" })
	})

	it("should throw if val is not string", () => {
		expect(() => getJwtContent(undefined as never)).toThrow()
	})

	it("should throw if val does not have valid number of sections", () => {
		expect(() => getJwtContent("without_dot")).toThrow()
	})

	it("should throw if parsing fails", () => {
		asMock(fromBase64).mockImplementation(() => throwErr("271836"))
		expect(() => getJwtContent("some.jwt.value")).toThrow()
	})
})
