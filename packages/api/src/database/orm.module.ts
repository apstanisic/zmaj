import { InfraStateService } from "@api/infra/infra-state/infra-state.service"
import { INFRA_SCHEMA_SYNC_FINISHED } from "@api/infra/infra.consts"
import { Global, Module } from "@nestjs/common"
import { Orm, RepoManager } from "@zmaj-js/orm"
import { BootstrapOrm } from "./BootstrapOrm"

@Global()
@Module({
	providers: [
		{
			provide: Orm,
			inject: [BootstrapOrm, InfraStateService, INFRA_SCHEMA_SYNC_FINISHED],
			useFactory: async (orm: BootstrapOrm, state: InfraStateService) => {
				orm.updateModels(state._collectionsForOrm)
				return orm
			},
		},
		{
			provide: RepoManager,
			inject: [Orm],
			useFactory: async (orm: Orm) => orm.repoManager,
		},
	],
	exports: [Orm, RepoManager],
})
export class OrmModule {}
