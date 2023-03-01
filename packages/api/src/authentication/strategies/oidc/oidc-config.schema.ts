import { z } from "zod"

const OidcProviderSchema = z.object({
	name: z.string().min(1).max(40),
	clientId: z.string().min(1).max(200),
	clientSecret: z.string().min(1).max(200),
	issuer: z.string().min(1).max(200),
})

export const OidcConfigSchema = z.object({
	providers: z.array(OidcProviderSchema).default([]),
})
