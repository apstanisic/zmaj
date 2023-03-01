import { Struct } from "@common/types"

/**
 * Get number of properties in object
 */
export function objectLength(obj: Struct): number {
	return Object.keys(obj).length
}
