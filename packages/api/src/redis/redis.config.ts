import { ConfigService } from "@api/config/config.service"
import { Inject, Injectable } from "@nestjs/common"
import { ZodDto } from "@zmaj-js/common"
import { z } from "zod"
import { MODULE_OPTIONS_TOKEN } from "./redis.module-definition"

const RedisConfigSchema = z.object({
	/** Redis host */
	host: z.string().min(1).max(1000).default("127.0.0.1"),
	/** Port */
	port: z.number().int().gte(1).lte(65535).default(6379),
	/** Username */
	username: z.string().max(200).optional(),
	/** Password */
	password: z.string().max(200).optional(),
	/** Is Redis enabled */
	enabled: z.boolean().default(false),
})

export type RedisConfigParams = Partial<z.infer<typeof RedisConfigSchema>>

@Injectable()
export class RedisConfig extends ZodDto(RedisConfigSchema) {
	constructor(@Inject(MODULE_OPTIONS_TOKEN) params: RedisConfigParams, appConfig: ConfigService) {
		const username = params.username ?? appConfig.get<string>("REDIS_USERNAME")
		const password = params.password ?? appConfig.get<string>("REDIS_PASSWORD")
		const host = params.host ?? appConfig.get<string>("REDIS_HOST")
		const port = params.port ?? appConfig.get<number>("REDIS_PORT")
		const enabled = params.enabled ?? appConfig.get<boolean>("REDIS_ENABLED")

		const withEnv: RedisConfigParams = { ...params, username, password, host, port, enabled }

		super(withEnv as Required<typeof withEnv>)
	}
}
