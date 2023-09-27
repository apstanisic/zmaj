import { Module } from "@nestjs/common"
import { AuthorizationRules } from "../authorization.rules"
import { AuthorizationState } from "./authorization.state"
import { DbAuthorizationRules } from "./db-authorization.rules"
import { PermissionsModule } from "./permissions/permissions.module"
import { RolesModule } from "./roles/roles.module"

@Module({
	imports: [RolesModule, PermissionsModule],
	providers: [
		AuthorizationState, //
		{ provide: AuthorizationRules, useClass: DbAuthorizationRules },
	],
	exports: [AuthorizationRules],
})
export class DbAuthorizationModule {}
