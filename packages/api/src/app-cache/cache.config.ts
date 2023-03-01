import { Inject, Injectable } from "@nestjs/common"
import { ZodDto } from "@zmaj-js/common"
import { z } from "zod"
import { MODULE_OPTIONS_TOKEN } from "./cache.module-definition"

const CacheConfigSchema = z.object({
	type: z.literal("memory").default("memory"),
	enabled: z.boolean().default(false),
	ttlMs: z.number().min(1000).max(Number.MAX_SAFE_INTEGER).default(5000),
})

export type CacheConfigParams = z.input<typeof CacheConfigSchema>

@Injectable()
export class CacheConfig extends ZodDto(CacheConfigSchema) {
	constructor(@Inject(MODULE_OPTIONS_TOKEN) params: CacheConfigParams) {
		super(params)
	}
}
