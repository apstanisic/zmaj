import { it, expect, describe } from "vitest"
import { createBasicToken } from "./create-basic-token"

describe("createBasicToken", () => {
	it("should create basic token", () => {
		const bt1 = createBasicToken("admin@example.com", "password")
		expect(bt1).toEqual("Basic YWRtaW5AZXhhbXBsZS5jb206cGFzc3dvcmQ=")

		const bt2 = createBasicToken("john-smith@test.test", "my-super-password")
		expect(bt2).toEqual("Basic am9obi1zbWl0aEB0ZXN0LnRlc3Q6bXktc3VwZXItcGFzc3dvcmQ=")
	})
})
