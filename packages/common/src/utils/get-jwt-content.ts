import { Struct } from "@common/types/struct.type"
import { isString } from "radash"
import { fromBase64 } from "./from-base-64"

/**
 * Get contents of a jwt token
 *
 * It's a small version that does not require full jwt (12kb), since we only care about data
 * @param jwt Jwt token
 */
export function getJwtContent(jwt: string): Struct {
	if (!isString(jwt)) throw new Error("#5123")
	const base64Content = jwt.split(".")[1]
	if (base64Content === undefined) throw new Error("84712")
	try {
		const content = fromBase64(base64Content)
		return JSON.parse(content)
	} catch (error) {
		throw new Error("#5419")
	}
}
