import { max } from "radash"

/** Convert page to offset */
export function pageToOffset(page: number, limit: number): number {
	const offset = (page - 1) * limit
	return max([offset, 0])!
}
