import { mixedColDef } from "@api/collection-to-model-config"
import { InfraStateService } from "@api/infra/infra-state/infra-state.service"
import { INFRA_SCHEMA_SYNC_FINISHED } from "@api/infra/infra.consts"
import { Global, Module } from "@nestjs/common"
import { Orm, RepoManager } from "@zmaj-js/orm"
import { SequelizeService } from "@zmaj-js/orm-sq"

@Global()
@Module({
	providers: [
		{
			provide: RepoManager,
			inject: [Orm, InfraStateService, INFRA_SCHEMA_SYNC_FINISHED],
			useFactory: async (orm: Orm, state: InfraStateService) => {
				const sq = orm.engine.engineProvider as SequelizeService
				// generate models with newly inited state
				sq.updateModels(mixedColDef(Object.values(state.collections)))
				return sqRepoManager
			},
		},
	],
	exports: [RepoManager],
})
export class OrmModule {}
