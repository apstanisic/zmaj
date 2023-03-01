import { describe, expect, it } from "vitest"
import { CrudClient } from "./crud.client"
import { PermissionsClient } from "./permissions.client"

describe("PermissionsClient", () => {
	it("should extends CrudClient", () => {
		const client = new PermissionsClient({} as any)
		expect(client).toBeInstanceOf(CrudClient)
	})
})
