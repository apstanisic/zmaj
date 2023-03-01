import { describe, expect, it } from "vitest"
import { CrudClient } from "./crud.client"
import { RolesClient } from "./roles.client"

describe("RolesClient", () => {
	it("should extends CrudClient", () => {
		const client = new RolesClient({} as any)
		expect(client).toBeInstanceOf(CrudClient)
	})
})
