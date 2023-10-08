import { ConfigService } from "@api/config/config.service"
import { Inject, Injectable } from "@nestjs/common"
import { ZodDto } from "@zmaj-js/common"
import { DatabaseConfig as OrmDatabaseConfig } from "@zmaj-js/orm"
import { z } from "zod"
import { MODULE_OPTIONS_TOKEN } from "./database.module-definition"

const DatabaseConfigSchema = z.object({
	type: z.enum(["postgres"]),
	username: z.string().min(1).max(200),
	password: z.string().min(1).max(200),
	host: z.string().min(1).max(500),
	database: z.string().min(1).max(200),
	port: z.number().int().gte(1).lte(99999),
	logging: z.boolean().default(false),
	/** TODO Use for SQLite */
	// filename: z.string().optional(),
})

export type DatabaseConfigParams = Partial<z.infer<typeof DatabaseConfigSchema>>

@Injectable()
export class DatabaseConfig extends ZodDto(DatabaseConfigSchema) implements OrmDatabaseConfig {
	constructor(
		@Inject(MODULE_OPTIONS_TOKEN) params: DatabaseConfigParams,
		configService: ConfigService,
	) {
		const type = params.type ?? configService.get<string>("DB_TYPE") ?? "postgres"

		const username = params.username ?? configService.get<string>("DB_USERNAME")
		const password = params.password ?? configService.get<string>("DB_PASSWORD")
		const host = params.host ?? configService.get<string>("DB_HOST")
		const port = params.port ?? configService.get<number>("DB_PORT")
		const database = params.database ?? configService.get<string>("DB_DATABASE")
		const logging = params.logging ?? configService.get<boolean>("DB_LOGGING")

		const withEnv: DatabaseConfigParams = {
			...params,
			username,
			password,
			host,
			port,
			database,
			logging,
			type: type as any,
			// filename,
		}

		super(withEnv as Required<typeof withEnv>)
	}
}
