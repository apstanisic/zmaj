import { Global, Module } from "@nestjs/common"
import { AuthorizationConfig } from "./authorization.config"
import { AuthorizationController } from "./authorization.controller"
import { ConfigurableModuleClass } from "./authorization.module-definition"
import { AuthorizationService } from "./authorization.service"
import { DbAuthorizationModule } from "./db-authorization/db-authorization.module"

export type { AuthorizationParams } from "./authorization.config"

@Global()
@Module({
	imports: [DbAuthorizationModule],
	controllers: [AuthorizationController],
	providers: [AuthorizationService, AuthorizationConfig],
	exports: [AuthorizationService, AuthorizationConfig],
})
export class AuthorizationModule extends ConfigurableModuleClass {}
