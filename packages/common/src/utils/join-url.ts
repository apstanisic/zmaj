import urlJoin from "url-join"
import { trimStart } from "./lodash"

// https://github.com/jfromaniello/url-join/issues/40
export function joinUrl(...parts: string[]): string {
	const trimmed = parts.map((p, i) => (i > 0 ? trimStart(p, "/") : p))
	return urlJoin(...trimmed)
}
