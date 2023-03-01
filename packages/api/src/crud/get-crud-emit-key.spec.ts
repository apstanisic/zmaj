import { FileCollection } from "@zmaj-js/common"
import { describe, expect, it } from "vitest"
import { getCrudEmitKey } from "./get-crud-emit-key"

describe("getCrudEmitKey", () => {
	it("should get proper key", () => {
		const key = getCrudEmitKey({ action: "create", collection: FileCollection, type: "after" })
		expect(key).toBe("zmaj.crud.after.create.zmaj_files")
	})

	it("should allow string for collection", () => {
		const key = getCrudEmitKey({ action: "create", collection: "posts", type: "after" })
		expect(key).toBe("zmaj.crud.after.create.posts")
	})

	it("should allow * for any", () => {
		const key = getCrudEmitKey({ action: "*", collection: "*", type: "*" })
		expect(key).toBe("zmaj.crud.*.*.*")
	})
})
