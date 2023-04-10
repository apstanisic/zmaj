import { ZodDto } from "@zmaj-js/common"
import { Primitive } from "type-fest"
import { z } from "zod"

const DatabaseConfigSchema = z.object({
	type: z.enum(["postgres"]).default("postgres"),
	username: z.string().min(1).max(200),
	password: z.string().min(1).max(200),
	host: z.string().min(1).max(500),
	database: z.string().min(1).max(200),
	port: z.coerce.number().int().gte(1).lte(99999),
	logging: z.boolean().default(false),
})

export type DatabaseConfigParams = Partial<z.infer<typeof DatabaseConfigSchema>>

type IConfigService = {
	get<T extends Primitive | Date>(key: string): T | undefined
}

export class DatabaseConfig extends ZodDto(DatabaseConfigSchema) {
	constructor(
		params: DatabaseConfigParams,
		appConfig: IConfigService = { get: (key) => process.env[key] as any },
	) {
		const type: any = params.type ?? appConfig.get<string>("DB_TYPE")

		const username = params.username ?? appConfig.get<string>("DB_USERNAME")
		const password = params.password ?? appConfig.get<string>("DB_PASSWORD")
		const host = params.host ?? appConfig.get<string>("DB_HOST")
		const port = params.port ?? appConfig.get<number>("DB_PORT")
		const database = params.database ?? appConfig.get<string>("DB_DATABASE")
		const logging = params.logging ?? appConfig.get<boolean>("DB_LOGGING")

		const withEnv: DatabaseConfigParams = {
			...params,
			username,
			password,
			host,
			port,
			database,
			logging,
			type,
			// filename,
		}

		super(withEnv as Required<typeof withEnv>)
	}
}
