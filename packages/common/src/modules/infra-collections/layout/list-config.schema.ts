import { DbFieldSchema } from "@common/zod"
import { unique } from "radash"
import { JsonObject } from "type-fest"
import { z } from "zod"

export const ListConfigSchema = z.object({
	/**
	 * Hide delete button in rows
	 */
	hideDelete: z.boolean().default(false),
	/**
	 * How should list be sorted by default
	 */
	defaultSort: z
		.object({
			field: DbFieldSchema,
			order: z.enum(["ASC", "DESC"]).default("ASC"),
		})
		.optional(),
	/**
	 * Fields that can be used to sort
	 * If value is not provided, every field will be displayed as sortable
	 * We will only show fields that have property `sortable` set to `true`
	 * This could be used to limit gui
	 */
	sortableFields: z
		.array(z.string())
		.transform((v) => unique(v))
		.optional(),
	/**
	 * Fields that can be used to filter
	 * If value is not provided, all can be filterable
	 */
	filterableFields: z
		.array(z.string())
		.transform((v) => unique(v))
		.optional(),
	/**
	 * How many rows to show per page
	 */
	perPage: z
		.object({
			/**
			 * Default amount of records per page
			 */
			default: z.number(),
			/**
			 * Amounts that are allowed to be set for per page
			 */
			options: z.array(z.number().max(200)).transform((v) => unique(v)),
		})
		.default({ default: 10, options: [10, 20, 50] })
		.refine((v) => v.options.includes(v.default), {
			message: "Options must include default value",
		}),
	/**
	 * Hide pagination
	 */
	hidePagination: z.boolean().default(false),
	/**
	 * Disable filtering
	 */
	disableFilter: z.boolean().default(false),
	/**
	 * What quick filter key to use
	 * If it's not equality, comparison should be separated by "__", eg. price__$gte
	 * If `true`, it will use `$q`, which is a special key to search all allowed fields
	 * If `false`, filter is disabled,
	 * If string, use value as key
	 */
	quickFilter: z
		.union([
			z.string().min(1).max(100),
			z.boolean(), //
		])
		.transform((v): string | false => (v === true ? "$q" : v))
		.default("$q"),
	/**
	 * Filter that should always be applied
	 * For example, we don't want to show deleted users
	 * This filter is joined with other filters
	 * key is field name, value is value
	 * If you want custom comparison ($ne, $lte), you can separate field and comparison with
	 * double underscore, eg: `{ price__$gte: 50, soldAt__$exists: true }`
	 */
	permanentFilter: z
		.record(z.unknown())
		.default({})
		.transform((v): JsonObject => structuredClone(v) as any),
	/**
	 * What layout to use
	 */
	layoutType: z.string().min(1).max(100).default("table"),
	/**
	 * Is multi select disabled
	 */
	disableMultiSelect: z.boolean().default(false),
	/**
	 * Template to be used for title.
	 * If not provided, it will fallback to collection's `displayTemplate`
	 * Not all layout use this config
	 */
	primaryTemplate: z.string().min(1).max(300).optional(),
	/**
	 * Secondary info
	 * Not all layout use this config
	 */
	secondaryTemplate: z.string().min(1).max(300).optional(),
	/**
	 * Third info
	 * Not all layout use this config
	 */
	tertiaryTemplate: z.string().min(1).max(300).optional(),
	/**
	 * What fields to show and in which order
	 */
	fieldsOrder: z
		.array(z.string())
		.transform((v) => unique(v))
		.optional(),

	/**
	 *
	 */
	size: z.enum(["small", "medium", "large"]).default("medium"),
})
