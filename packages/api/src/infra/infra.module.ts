import { Global, Module } from "@nestjs/common"
import { CollectionsModule } from "./collections-info/collections.module"
import { FieldsModule } from "./fields/fields.module"
import { InfraSchemaSyncModule } from "./infra-schema-sync/infra-schema-sync.module"
import { InfraStateModule } from "./infra-state/infra-state.module"
import { InfraController } from "./infra.controller"
import { InfraService } from "./infra.service"
import { OnInfraChangeService } from "./on-infra-change.service"
import { RelationsModule } from "./relations/relations.module"
import { UserInfraService } from "./user-infra.service"
import { ConfigurableModuleClass } from "./infra.module-definition"
import { InfraConfig } from "./infra.config"

@Global()
@Module({
	imports: [
		CollectionsModule,
		FieldsModule,
		RelationsModule,
		InfraSchemaSyncModule,
		InfraStateModule,
	],
	providers: [UserInfraService, OnInfraChangeService, UserInfraService, InfraService, InfraConfig],
	exports: [OnInfraChangeService, UserInfraService, InfraService, InfraConfig],
	controllers: [InfraController],
})
export class InfraModule extends ConfigurableModuleClass {}
