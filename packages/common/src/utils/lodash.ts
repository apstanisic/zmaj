/**
 * Some missing function from `radash` that exist in `lodash`
 */

import { list, snake } from "radash"

/**
 *
 */
export function truncate(val: string, { length = 30 }: { length: number }): string {
	if (val.length <= length) return val
	return `${val.substring(0, length - 3)}...`
}

export function isNil<T>(value: T | undefined | null): value is undefined | null {
	return value === null || value === undefined
}

// I miss lodash.times
export function times(size: number): number[]
export function times<T>(size: number, fn: (i: number) => T): T[]
export function times<T>(size: number, fn?: (i: number) => T): T[] | number[] {
	return list(0, size - 1, fn)

	// const arr = [...Array(size).keys()]
	// if (fn === undefined) return arr
	// return arr.map((i) => fn(i))
}

export function trimStart(val: string, toTrimChars: string = " "): string {
	const regex = new RegExp(`^[${toTrimChars.replace(/[\W]{1}/g, "\\$&")}]+`, "g")
	return val.replace(regex, "")
}

export function trimEnd(val: string, toTrimChars: string = " "): string {
	const regex = new RegExp(`[${toTrimChars.replace(/[\W]{1}/g, "\\$&")}]+$`, "g")
	return val.replace(regex, "")
}

// https://github.com/rayepps/radash/issues/248
export function snakeCase(val: string): string {
	return snake(val).replace(/([A-Za-z]{1}[0-9]{1})/, (val) => `${val[0]!}_${val[1]!}`)
}

export function castArray<T>(val: T | T[]): T[] {
	return Array.isArray(val) ? val : [val]
}

// export function trimStart(val: string, toTrimChars: string = " "): string {
// 	const regex = new RegExp(`^[${toTrimChars.split('').join('\\')}]+`, 'g')
// 	return val.replace(regex, '')
// }

// export function trimEnd(val: string, toTrimChars: string = " "): string {
// 	const regex = new RegExp(`[${toTrimChars.split('').join('\\')}]+$`, 'g')
// 	return val.replace(regex, '')
// }

export function clamp(val: number, lower: number, upper: number): number {
	if (typeof val !== "number" || isNaN(val)) return lower
	if (val >= lower && val <= upper) return val
	return val >= lower ? upper : lower
}

export function isBoolean(val: any): val is boolean {
	return typeof val === "boolean"
}

export function isError(err: any): err is Error {
	return err instanceof Error
}

// https://stackoverflow.com/a/9310752
// from lodash
export function escapeRegExp(string: string): string {
	const reRegExpChar = /[\\^$.*+?()[\]{}|]/g
	const reHasRegExpChar = RegExp(reRegExpChar.source)
	return reHasRegExpChar.test(string) ? string.replace(reRegExpChar, "\\$&") : string
}
