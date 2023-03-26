import { columnNameRegex } from "@common/regexes"
import { z } from "zod"
import { isNil } from ".."

/** Zod validation for db column and table name  */
export const DbFieldSchema = z.string().regex(columnNameRegex).min(2).max(100)

/** Zod validation for password */
export function ZodPassword(): z.ZodString {
	return z.string().trim().min(8).max(80)
}

export function ZodIdType(): z.ZodUnion<[z.ZodString, z.ZodNumber]> {
	return z.union([z.string().uuid(), z.coerce.number().int().min(1).finite()])
}

export function zodCastBool(val: unknown): unknown {
	if (val === "true") return true
	if (val === "false") return false
	return val
}

export function zodStripNull<T>(val: T | undefined | null): T | undefined {
	return val === null ? undefined : val
}

// zod default only works on undefined, this adds it for null as well
export function nilDefault<T, D extends T>(def: D): (v: T | null | undefined) => T {
	return (val: T | undefined | null) => (isNil(val) ? def : val)
}
