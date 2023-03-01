import { Global, Module } from "@nestjs/common"
import { ExpandRelationsService } from "./expand-relations.service"
import { InfraStateProvider } from "./infra-state.provider"
import { InfraStateService } from "./infra-state.service"

@Global()
@Module({
	providers: [InfraStateProvider, ExpandRelationsService],
	exports: [InfraStateService],
})
export class InfraStateModule {}
