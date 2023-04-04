import { Struct } from "@common/types/struct.type"
import { format, fromUnixTime, parseISO } from "date-fns"
import { camel, isNumber, isString, trim } from "radash"
import { isNil, snakeCase, truncate } from "./lodash"
import { notNil } from "./not-nil"

export type TemplateParserPipe = (value: unknown, record: Struct<unknown>) => unknown

type ParseOptions = {
	fallback?: unknown
}

// const templateRegex = /\{(.*?)\}/g
// This regex does not allow nested "{{}}", which is desired behavior
// It does not allow escaping, but that's outside the scope
const templateRegex = /\{([^{}]*?)\}/g

/**
 * Simple template engine that replaces {key} with value.
 *
 * There is no escaping for now.
 * User can provide pipes. For example ('hello {value|upperCase}' => 'hello WORLD')
 * @param templateString Template: `'hello {value}'`
 * @param values Values to be used: `{ value: 'world' }`
 * @returns Parsed template
 * Maybe in the future use lodash with this settings:
 * _.templateSettings.interpolate = /{([\s\S]+?)}/g;
 * It does that but it does not have support for pipes
 *
 * @outdated
 * User is passing unknown data, so we allow undefined as value,
 * and will replace it with empty if undefined
 */
export class TemplateParser {
	constructor(private availablePipes: Struct<TemplateParserPipe> = {}) {}

	/**
	 * Regex that captures "{ this content inside brackets with spaces}"
	 * Webkit does not support regex bellow
	 * @see https://caniuse.com/js-regexp-lookbehind
	 * ```js
	 * private regex = /(?<=\{)(.*?)(?=\})/g
	 * ```
	 */

	addPipe(name: string, pipe: TemplateParserPipe): void {
		this.availablePipes[name] = pipe
	}

	/**
	 * @param template Template
	 * @param values Values to inject in template
	 * @param options Additional options
	 * @returns parsed template
	 */
	parse(template: string, values?: Struct<unknown> | null, options: ParseOptions = {}): string {
		values ??= {}
		const toReplace = template.match(templateRegex) ?? []
		for (const item of toReplace) {
			const value = this.parseVar(trim(item, "{}"), values)
			template = template.replace(item, value)

			// if using regex with look behind
			// Replace {var} with real value with parsed hooks
			// webkit does not support lok
			// const value = this.parseVar(item, values)
			// template = template.replace("{" + item + "}", value)
		}

		// Trim template in the end if some pipe create space
		template = template.trim()

		// return fallback if template is 0 char long and
		if (template.length === 0 && notNil(options.fallback)) return String(options.fallback)

		return template
	}

	private countVars(template: string): number | never {
		const chars = template.split("")

		// How many "{" template have. That many replacements needs to be done
		const openBracketLength = chars.filter((char) => char === "{").length
		const closeBracketLength = chars.filter((char) => char === "}").length

		if (openBracketLength !== closeBracketLength) throw new Error("Invalid template")
		return openBracketLength
	}

	private parseVar(rawValue: string, values: Struct<unknown>): string {
		// Space is ignored inside of "{}"
		const [varName = "", ...pipes] = rawValue.split("|").map((val) => val.trim())

		// Should I convert to string here
		let value = values[varName]

		for (const pipeName of pipes) {
			const pipe = this.availablePipes[pipeName]
			if (!pipe) continue
			value = pipe(value, values ?? {}) ?? value
		}
		const stringValue = String(value ?? "")
		return stringValue.trim()
	}
}

const basicPipes: Record<string, TemplateParserPipe> = {
	lowerCase: (value) => String(value).toLowerCase(),
	upperCase: (value) => String(value).toUpperCase(),
	orUnknown: (value) => (isNil(value) ? "UNKNOWN" : value),
	camelCase: (v) => camel(String(v)),
	snakeCase: (v) => snakeCase(String(v)),
	fromCents: (v) => {
		const str = String(v).padStart(3, "0")
		return str.substring(0, str.length - 2) + "." + str.substring(str.length - 2)
	},
	truncate: (value) => {
		const asString = trim(JSON.stringify(value), '"')
		return truncate(asString, { length: 50 })
	},
	date: (v) => {
		const parsed =
			v instanceof Date ? v : isString(v) ? parseISO(v) : isNumber(v) ? fromUnixTime(v) : null
		if (!parsed) return ""
		return format(parsed, "dd MMMM yyyy - HH:mm")
	},
	/**
	 * Converts value in bytes to kilobytes
	 * @param value Text value
	 * @returns Value converted to kilobytes
	 */
	toKb: (value) => {
		const parsed = parseInt(String(value))
		return isFinite(parsed) ? Math.round(parsed / 1024).toString() : String(value)
	},
}

export const templateParser = new TemplateParser(basicPipes)
