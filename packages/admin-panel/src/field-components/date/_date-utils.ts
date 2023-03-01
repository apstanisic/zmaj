import { format } from "date-fns"
import { isDate, isNumber } from "radash"

/**
 * Convert dateTime, time with ms, time since unix epoch to time
 *
 * Since we are converting date strings to Date objects, if for some reason date is string,
 * just return string, since there are to many formats to convert
 *
 * @param date Full value, it can be date with time, and type of time, number for unix epoch, or string
 * @returns Only time with seconds
 */
export function extractDate(date: string | Date | number): string {
	if (isDate(date)) return format(date, "yyyy-MM-dd")
	if (isNumber(date)) return format(new Date(date), "yyyy-MM-dd")

	return date
}
