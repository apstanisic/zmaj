import { joinFilters } from "./join-filters"

import { it, expect, describe } from "vitest"

describe("joinFilters", () => {
	it("should ignore invalid values and empty object ", () => {
		const res = joinFilters({}, 5, "hello", [], { test: "me" })
		expect(res).toEqual({ test: "me" })
	})

	it("should remove $and if there is only one filter", () => {
		const res = joinFilters({ test: "me" }, {}, {})
		expect(res).toEqual({ test: "me" })
	})

	it("should join with $and", () => {
		const res = joinFilters({ test: "me" }, { test: 2 }, {})
		expect(res).toEqual({ $and: [{ test: "me" }, { test: 2 }] })
	})

	it("should flatten 'and' filters", () => {
		const f1 = { $and: [{ id: 1 }] }
		const f2 = { $and: [{ id: 2 }, { id: 3 }] }
		const f3 = { $and: [] }
		const f4 = { name: "test" }

		const res = joinFilters(f1, f2, f3, f4)

		expect(res).toEqual({
			$and: [
				{ id: 1 }, //
				{ id: 2 },
				{ id: 3 },
				{ name: "test" },
			],
		})
	})

	it("should handle deeply nested 'and'", () => {
		const f1 = {
			$and: [
				{
					$and: [
						{ test: "me" },
						{ super: "man" },
						{
							$and: [{ hello: "world" }, { it: "test" }], //
						},
					], //
				},
			],
		}
		const f2 = { $and: [{ id: 2 }, { id: 3 }] }

		const res = joinFilters(f1, f2)
		expect(res).toEqual({
			$and: [
				{ test: "me" },
				{ super: "man" },
				{ hello: "world" },
				{ it: "test" },
				{ id: 2 },
				{ id: 3 }, //
			],
		})
		//
	})
})
