import { Inject, Injectable } from "@nestjs/common"
import { ZodDto } from "@zmaj-js/common"
import { z } from "zod"
import { MODULE_OPTIONS_TOKEN } from "./config.module-definition"

const ConfigSchema = z.object({
	/** Default env file path */
	envPath: z.string().default(".env"),
	/** Should we throw if env file does not exist */
	throwOnNoEnvFile: z.boolean().default(true),
	/** Should we ignore env file */
	useEnvFile: z.boolean().default(false),
	/** Should we ignore process.env values, and only use env files */
	useProcessEnv: z.boolean().default(false),
	assignToProcessEnv: z.boolean().default(false),
})

export type ConfigModuleParams = z.input<typeof ConfigSchema>

@Injectable()
export class ConfigModuleConfig extends ZodDto(ConfigSchema) {
	constructor(@Inject(MODULE_OPTIONS_TOKEN) params: ConfigModuleParams) {
		super(params)
	}
}
