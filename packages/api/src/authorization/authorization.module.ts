import { Global, Module } from "@nestjs/common"
import { AuthorizationConfig } from "./authorization.config"
import { AuthorizationController } from "./authorization.controller"
import { ConfigurableModuleClass } from "./authorization.module-definition"
import { AuthorizationService } from "./authorization.service"
import { AuthorizationState } from "./authorization.state"
import { PermissionsModule } from "./permissions/permissions.module"
import { RolesModule } from "./roles/roles.module"

export type { AuthorizationParams } from "./authorization.config"

@Global()
@Module({
	imports: [RolesModule, PermissionsModule],
	controllers: [AuthorizationController],
	providers: [
		AuthorizationService,
		AuthorizationState,
		AuthorizationConfig,
		// { provide: APP_GUARD, useClass: AuthorizationGuard,  },
	],
	exports: [AuthorizationService],
})
export class AuthorizationModule extends ConfigurableModuleClass {}
