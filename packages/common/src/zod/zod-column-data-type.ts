import { z } from "zod"

export const ZodColumnDataType = z.enum([
	// string
	"short-text",
	"long-text",
	// number
	"int",
	"float",
	// date
	"datetime",
	"date",
	"time",
	// other
	"boolean",
	"json",
	"uuid",
])
