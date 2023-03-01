import { parseJsonWithDates } from "./parse-json-with-dates"

import { sub } from "date-fns"
import { describe, expect, it } from "vitest"

describe("parseJsonWithDates", () => {
	it("should hydrate date values", () => {
		const obj = {
			name: "test",
			id: 5,
			date1: new Date(),
			date2: sub(new Date(), { minutes: 55, hours: 2, months: 3, years: 19 }),
		}
		const res = parseJsonWithDates(JSON.stringify(obj))
		expect(res).toEqual(obj)
		expect(res["date1"]).toBeInstanceOf(Date)
	})
	//
})
