import { isNil } from "@zmaj-js/common"
import { isObject } from "radash"
import { isValidElement, ReactElement } from "react"

/**
 *
 * If we provide json object value to display, react will throw an error. This converts any
 * incompatible value to string
 *
 * @param val
 * @returns
 */
export function ensureValidChild(val: unknown): ReactElement | string {
	if (isNil(val)) return ""
	if (isValidElement(val as any)) return val as ReactElement
	if (isObject(val)) return JSON.stringify(val)
	return String(val)
}
