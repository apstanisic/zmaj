import { timeRegex } from "@zmaj-js/common"
import { format } from "date-fns"
import { isDate, isNumber } from "radash"

/**
 * Convert dateTime, time with ms, time since unix epoch to time
 *
 * @param dateTime Full value, it can be date with time, and type of time, number for unix epoch, or string
 * @returns Only time with seconds
 */
export function extractTime(dateTime: string | Date | number = "00:00:00"): string {
	if (isDate(dateTime)) return format(dateTime, "HH:mm:ss")
	if (isNumber(dateTime)) return format(new Date(dateTime), "HH:mm:ss")

	// if fulfils regex, return parsed, otherwise, return original value
	const valid = timeRegex.exec(dateTime)?.[0]
	return valid ?? String(dateTime)
}
