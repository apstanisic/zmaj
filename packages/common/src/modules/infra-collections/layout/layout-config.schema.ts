import { zodCreate } from "@common/zod"
import { z } from "zod"
import { ListConfigSchema } from "./list-config.schema"
import { InputConfigSchema, ShowConfigSchema } from "./non-list-config.schema"
// improve this
export { type LayoutConfigSections } from "./non-list-config.schema"
export const LayoutConfigSchema = z
	.object({
		/**
		 * What version, so we know how to parse it without BC
		 * If value is omitted, assume newest
		 */
		version: z.literal(0).optional(),
		/**
		 * Should delete button be shown
		 */
		hideDeleteButton: z.boolean().default(false),
		/**
		 * Should button to show changes on current record be shown
		 */
		hideChangesButton: z.boolean().default(false),
		/**
		 * Hide option to display record as JSON in Dialog
		 */
		hideDisplayAsJsonButton: z.boolean().default(false),
		/**
		 * List layout config
		 */
		list: ListConfigSchema.default({}),
		/**
		 * Show layout config
		 */
		show: ShowConfigSchema.default({}),
		/**
		 * Layout for create/edit.
		 * It contains option to specify things only for edit or create
		 */
		input: InputConfigSchema.default({}),
	})
	// Fallback to defaults if user does not provide good params
	.catch(() => ({
		hideChangesButton: false,
		hideDeleteButton: false,
		hideDisplayAsJsonButton: false,
		input: zodCreate(InputConfigSchema, {}),
		show: zodCreate(ShowConfigSchema, {}),
		list: zodCreate(ListConfigSchema, {}),
	}))
