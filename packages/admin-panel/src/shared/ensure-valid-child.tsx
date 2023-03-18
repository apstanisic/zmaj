import { isNil, templateParser } from "@zmaj-js/common"
import { isObject } from "radash"
import { isValidElement, ReactElement } from "react"

/**
 *
 * If we provide json object value to display, react will throw an error. This converts any
 * incompatible value to string
 *
 * @param value
 * @returns
 */
export function ensureValidChild(value: unknown, template?: string): ReactElement | string {
	if (isNil(value)) return ""
	if (isValidElement(value as any)) return value as ReactElement
	if (template) return templateParser.parse(template, { value }, { fallback: value })
	if (isObject(value)) return JSON.stringify(value)
	return String(value)
}
