import { Module } from "@nestjs/common"
import { PermissionsController } from "./permissions.controller"

/**
 * This module does not contain any logic, only crud. For business logic use AuthorizationModule
 */
@Module({
	providers: [],
	exports: [],
	controllers: [PermissionsController],
})
export class PermissionsModule {}
