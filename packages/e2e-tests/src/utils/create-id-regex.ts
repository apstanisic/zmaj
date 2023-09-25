const idRegexString = "([A-Za-z0-9-]+)"

/**
 *
 *
 * @param url All to replace
 * @returns regex if there is an "$ID", original string otherwise
 * @example
 * ```js
 * createIdRegex("hello/world/$ID/now")
 * createIdRegex("regular/string")
 * ```
 */
export function createIdRegex(url: string): RegExp | string {
	if (!url.includes("$ID")) return url
	const parts = url.split("$ID")
	const all = parts.join(idRegexString)
	return new RegExp(all)
}

export const uuidInsideRegex =
	/[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}/
