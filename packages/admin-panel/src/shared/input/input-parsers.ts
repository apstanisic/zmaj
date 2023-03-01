import { jsonDateRegex, timeRegex } from "@zmaj-js/common"
import { format, parse, startOfDay, startOfMinute } from "date-fns"
import { isDate, isNumber } from "radash"

export const dateTimeLocalRegex = /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})$/
export const dateRegex = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/

export const parseInput = {
	number: {
		toInput(val: unknown) {
			return String(val ?? "")
		},
		fromInput(val: string) {
			const parsed = parseFloat(val)
			return isFinite(parsed) ? parsed : null
		},
	},
	date: {
		toInput(val: unknown) {
			if (isDate(val)) return format(val, "yyyy-MM-dd")
			if (dateRegex.test(String(val))) return val
			if (jsonDateRegex.test(String(val))) return format(new Date(String(val)), "yyyy-MM-dd")
			return ""
		},
		fromInput(val: string) {
			if (dateRegex.test(val)) return parse(val, "yyyy-MM-dd", startOfDay(new Date()))
			return null
		},
	},
	time: {
		toInput(val: unknown) {
			if (isDate(val)) return format(val, "HH:mm:ss")
			if (timeRegex.test(String(val))) return val
			if (jsonDateRegex.test(String(val))) return format(new Date(String(val)), "HH:mm:ss")
			return ""
		},
		fromInput(val: string) {
			if (timeRegex.test(val)) return val
			return null
		},
	},

	"datetime-local": {
		toInput: (value: unknown) => {
			let asDate: Date | null = null

			if (isDate(value)) {
				asDate = value
			} else if (isNumber(value)) {
				asDate = new Date(value)
			} else if (jsonDateRegex.test(String(value))) {
				asDate = new Date(String(value))
			} else if (dateTimeLocalRegex.test(String(value))) {
				asDate = parse(
					String(value).replace("T", " "),
					"yyyy-MM-dd HH:mm",
					startOfMinute(new Date()), //
				)
			}
			return asDate === null ? "" : format(asDate, "yyyy-MM-dd HH:mm").replace(" ", "T")
		},
		fromInput(value: string) {
			if (dateTimeLocalRegex.test(value)) {
				return parse(value.replace("T", " "), "yyyy-MM-dd HH:mm", startOfMinute(new Date()))
			}
			return null
		},
	},
}
