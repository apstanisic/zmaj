import { z } from "zod"
// import { IdArraySchema } from "./id-array.schema"

export const ToManyChangeSchema = z.object({
	type: z.literal("toMany"),
	// added: IdArraySchema,
	// removed: IdArraySchema,
	added: z.array(z.string().or(z.number().int().positive())),
	removed: z.array(z.string().or(z.number().int().positive())),
	// Not used currently
	// toCreate: z.array(z.record(z.unknown())).nullish(),
})
