import { IParseOptions, IStringifyOptions, parse, stringify } from "qs"
import { isString } from "radash"
import { Struct } from "./types"

const decoder: IParseOptions["decoder"] = (val, defaultDecoder, charset, type) => {
	// we always first have to decode value (url encoding...)
	val = defaultDecoder(val, defaultDecoder, charset)

	if (type === "key") return val

	if (!isString(val) || !val.startsWith("__")) return val

	if (val.startsWith("@@__")) return val.substring(2)
	if (val === "__null") return null
	if (val === "__undefined") return undefined
	if (val === "__true" || val === "__false") return val === "__true"
	// if (val.startsWith(`__boolean`)) return val.endsWith("true")
	if (val.startsWith("__D")) return new Date(val.substring(3))
	if (val.startsWith("__N")) return parseFloat(val.substring(3))
	return val
}
const encoder: IStringifyOptions["encoder"] = (value, defaultEncoder, charset, type) => {
	if (type === "key") return defaultEncoder(value, defaultEncoder, charset)
	let asString: string

	// null will never happen, it's handled by library, but keep this in case we switch library
	if (value === null) {
		asString = "__null"
	}
	// never happens, qs ignores undefined, keep just in case of switching library
	else if (value === undefined) {
		asString = "__undefined"
	}
	// boolean
	else if (typeof value === "boolean") {
		asString = "__" + value
	}
	// number
	else if (typeof value === "number") {
		asString = `__N${value}`
	}
	// date will already be serialized, but we added prefix in `serializeDate` so we know it's a date object
	// keep handling for Date object in case we switch library
	else if (value instanceof Date || String(value).startsWith("__D")) {
		asString = value instanceof Date ? `__D${value.getTime()}` : value
	}
	// value that already starts with __, so we escape it with @@
	else if (isString(value) && value.startsWith("__")) {
		asString = "@@" + value
	}
	// normal string
	else {
		asString = value
	}

	return defaultEncoder(asString, defaultEncoder, charset)
}

/**
 * Stringify value
 * It does not add "?" at beginning
 */
export function qsStringify(obj: any, options: IStringifyOptions = {}): string {
	return stringify(obj, {
		allowDots: true,
		encoder,
		strictNullHandling: true,
		serializeDate: (d) => `__D${d.toJSON()}`,
		addQueryPrefix: false,
		...options,
	})
}

/**
 * Parse value
 */
export function qsParse(val: string, options: IParseOptions = {}): Struct {
	return parse(val, {
		allowDots: true,
		decoder,
		depth: 15,
		arrayLimit: 50,
		strictNullHandling: true,
		ignoreQueryPrefix: true,
		...options,
	})
}
