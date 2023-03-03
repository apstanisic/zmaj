import { BootstrapRepoManager } from "@api/database/orm-specs/BootstrapRepoManager"
import { SchemaInfoService } from "@api/database/schema/schema-info.service"
import { InfraService } from "@api/infra/infra.service"
import { FactoryProvider } from "@nestjs/common"
import { INFRA_SCHEMA_SYNC_FINISHED } from "../infra.consts"
import { InfraStateService } from "./infra-state.service"

export const InfraStateProvider: FactoryProvider = {
	provide: InfraStateService,
	inject: [
		SchemaInfoService,
		InfraService,
		BootstrapRepoManager,
		INFRA_SCHEMA_SYNC_FINISHED, // inject this so we know that schema is synced before getting state
	],
	useFactory: async (
		schemaInfo: SchemaInfoService,
		infraService: InfraService,
		bRepo: BootstrapRepoManager,
	): Promise<InfraStateService> => {
		const state = new InfraStateService(schemaInfo, infraService, bRepo)
		await state.initializeState()

		return state
	},
}
