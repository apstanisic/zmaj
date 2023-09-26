import { Module } from "@nestjs/common"
import { AuthorizationState } from "./authorization.state"
import { DbAuthorizationRules } from "./db-authorization.rules"
import { PermissionsModule } from "./permissions/permissions.module"
import { RolesModule } from "./roles/roles.module"

@Module({
	imports: [RolesModule, PermissionsModule],
	providers: [DbAuthorizationRules, AuthorizationState],
	exports: [DbAuthorizationRules, AuthorizationState],
})
export class DbAuthorizationModule {}
