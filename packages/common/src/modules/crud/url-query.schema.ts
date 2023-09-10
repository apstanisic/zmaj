import { DbFieldSchema, zodCastBool, ZodIdType } from "@common/zod/zod-utils"
import { z } from "zod"

export type UrlFields = {
	[key: string]: true | UrlFields
}
/**
 * Schema that fields property must fulfill
 *
 * `qs` package sets boolean `true` to string `"true"`, zod will convert it to boolean
 * Must be in format:
 * @example
 * ```
 * const fields = {
 *   f1: true,
 *   f2: {
 *     n1: true
 *   }
 * }
 * ```
 *
 */
export const UrlFieldsSchema: z.ZodType<UrlFields> = z.lazy(() =>
	z.record(
		z.string(),
		z.union([
			z.preprocess(zodCastBool, z.literal(true)), //
			UrlFieldsSchema as any, // TODO Fix me
		]),
	),
)

/**
 * Every url query fullfil this schema
 *
 * `catchall` allows us to have non defined fields in query.
 * This allows user to pass values that he wants and still access them safely in proper url query
 * without having to use raw `req.query` object.
 * It type is unknown since it can be string, object, array, and maybe some other type
 *
 * This should be renamed, since it's only used when reading many
 */
export const UrlQuerySchemaStrict = z.object({
	// not used currently
	cursor: z.string().optional(),
	limit: z.coerce.number().int().min(1).max(200).catch(20),
	page: z.coerce.number().int().min(1).finite().catch(1),
	count: z.preprocess(zodCastBool, z.boolean().default(false)),
	// not used currently (for translations)
	language: z.string().optional(),
	sort: z.record(z.enum(["ASC", "DESC"])).catch(() => ({})),
	fields: UrlFieldsSchema.optional(), //default({}),
	filter: z.record(z.unknown()).catch(() => ({})),
	// M2M
	mtmCollection: DbFieldSchema.optional(),
	mtmProperty: DbFieldSchema.optional(),
	mtmRecordId: ZodIdType().optional(),
	// O2M
	// this field is used so we can provide users only records that they are allowed to update.
	// API can return correct values without this field, if filter is correct
	otmFkField: DbFieldSchema.optional(),
	// Should we provide records to O2M input that can't be updated (user does not have permission)
	otmShowForbidden: z.preprocess(zodCastBool, z.boolean().default(false)),
	//
})
// TODO Enable this. It interferes with infer
// .catchall(z.unknown())

export const UrlQuerySchema = UrlQuerySchemaStrict.catchall(z.unknown())
