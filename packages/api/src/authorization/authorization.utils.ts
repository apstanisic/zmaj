import { Struct } from "@zmaj-js/common"

/**
 * Set type of provided record for Casl
 */
export function toSubject(resourceName: string, record?: Struct): string | Struct {
	if (!record) return resourceName
	return { __caslType: resourceName, ...record }
}

/**
 * Helps Casl figure out the type of provided record
 */
export function detectSubjectType(record: Struct): any {
	return record["__caslType"]
}
