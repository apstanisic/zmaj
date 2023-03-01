import { RepoManager } from "@api/database/orm-specs/RepoManager"
import { InfraStateService } from "@api/infra/infra-state/infra-state.service"
import { INFRA_SCHEMA_SYNC_FINISHED } from "@api/infra/infra.consts"
import { SequelizeRepoManager } from "@api/sequelize/sequelize.repo-manager"
import { SequelizeService } from "@api/sequelize/sequelize.service"
import { Global, Module } from "@nestjs/common"

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
				sqService.generateModels(Object.values(state.collections))
				return sqRepoManager
			},
		},
	],
	exports: [RepoManager],
})
export class OrmModule {}
