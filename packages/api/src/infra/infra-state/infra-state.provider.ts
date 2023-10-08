import { BootstrapOrm } from "@api/database/BootstrapOrm"
import { InfraService } from "@api/infra/infra.service"
import { FactoryProvider } from "@nestjs/common"
import { SchemaInfoService } from "@zmaj-js/orm"
import { INFRA_SCHEMA_SYNC_FINISHED } from "../infra.consts"
import { InfraStateService } from "./infra-state.service"

export const InfraStateProvider: FactoryProvider = {
	provide: InfraStateService,
	inject: [
		SchemaInfoService,
		InfraService,
		BootstrapOrm,
		INFRA_SCHEMA_SYNC_FINISHED, // inject this so we know that schema is synced before getting state
	],
	useFactory: async (
		schemaInfo: SchemaInfoService,
		infraService: InfraService,
		orm: BootstrapOrm,
	): Promise<InfraStateService> => {
		const state = new InfraStateService(schemaInfo, infraService, orm)
		await state.initializeState()

		return state
	},
}
