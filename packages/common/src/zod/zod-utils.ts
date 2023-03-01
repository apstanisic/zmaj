import { columnNameRegex } from "@common/regexes"
import { z } from "zod"

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
