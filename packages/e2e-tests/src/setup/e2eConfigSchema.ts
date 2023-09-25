import { z } from "zod"

export const e2eConfigSchema = z.object({
	APP_URL: z.string().url(),
	DB_TYPE: z.enum(["postgres"]).default("postgres"),
	DB_USERNAME: z.string().min(1).max(200),
	DB_PASSWORD: z.string().min(1).max(200),
	DB_HOST: z.string().min(1).max(500),
	DB_DATABASE: z.string().min(1).max(200),
	DB_PORT: z.coerce
		.number()
		.int()
		.gte(1)
		.lte(99999)
		.transform((v) => v.toString()),
})
