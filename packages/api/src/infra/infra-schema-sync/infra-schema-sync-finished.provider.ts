import { FactoryProvider } from "@nestjs/common"
import { MIGRATIONS_FINISHED } from "@api/migrations/migrations.consts"
import { INFRA_SCHEMA_SYNC_FINISHED } from "../infra.consts"
import { InfraSchemaSyncService } from "./infra-schema-sync.service"

/**
 * All metadata is successfully created and synced
 */
export const InfraInitedProvider: FactoryProvider = {
	provide: INFRA_SCHEMA_SYNC_FINISHED,
	inject: [InfraSchemaSyncService, MIGRATIONS_FINISHED],
	useFactory: async (
		initInfra: InfraSchemaSyncService,
		_migrationDone: string,
	): Promise<typeof INFRA_SCHEMA_SYNC_FINISHED> => {
		await initInfra.sync()
		return INFRA_SCHEMA_SYNC_FINISHED
	},
}
