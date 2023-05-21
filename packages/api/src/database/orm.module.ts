import { mixedColDef } from "@api/collection-to-model-config"
import { InfraStateService } from "@api/infra/infra-state/infra-state.service"
import { INFRA_SCHEMA_SYNC_FINISHED } from "@api/infra/infra.consts"
import { Global, Module } from "@nestjs/common"
import { RepoManager, SequelizeRepoManager, SequelizeService } from "@zmaj-js/orm"

@Global()
@Module({
	providers: [
		{
			provide: RepoManager,
			inject: [
				SequelizeRepoManager,
				SequelizeService,
				InfraStateService,
				INFRA_SCHEMA_SYNC_FINISHED,
			],
			useFactory: async (
				sqRepoManager: SequelizeRepoManager,
				sqService: SequelizeService,
				state: InfraStateService,
			) => {
				// generate models with newly inited state
				sqService.generateModels(mixedColDef(Object.values(state.collections)))
				return sqRepoManager
			},
		},
	],
	exports: [RepoManager],
})
export class OrmModule {}
