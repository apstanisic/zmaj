import { InfraStateService } from "@api/infra/infra-state/infra-state.service"
import { INFRA_SCHEMA_SYNC_FINISHED } from "@api/infra/infra.consts"
import { Global, Module } from "@nestjs/common"
import { Orm, RepoManager } from "@zmaj-js/orm"
import { BootstrapOrm } from "./BootstrapRepoManager"

@Global()
@Module({
	providers: [
		{
			provide: RepoManager,
			inject: [Orm, InfraStateService, INFRA_SCHEMA_SYNC_FINISHED],
			useFactory: async (orm: Orm, state: InfraStateService) => {
				orm.updateModels(state._collectionsForOrm)
				return orm.repoManager
			},
		},

		{
			provide: Orm,
			inject: [BootstrapOrm, InfraStateService, INFRA_SCHEMA_SYNC_FINISHED],
			useFactory: async (orm: BootstrapOrm, state: InfraStateService) => {
				orm.updateModels(state._collectionsForOrm)
				return orm
			},
		},
	],
	exports: [RepoManager, Orm],
})
export class OrmModule {}
