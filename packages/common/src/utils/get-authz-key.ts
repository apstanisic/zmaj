import { throwErr } from "./throw-err"

export function getAuthzKey(collectionName: string): string {
	// camel case just in case
	if (!collectionName.startsWith("zmaj")) return `collections.${collectionName}`
	throwErr(new Error("Invalid collection"))
	// currently only used no non system tables
	// return camelCase(collectionName.replace("zmaj", ""))
}
