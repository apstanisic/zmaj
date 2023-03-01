import { Module } from "@nestjs/common"
import { AdminPanelInfoController } from "./admin-panel-auth.controller"
import { AdminPanelInfraController } from "./admin-panel-infra.controller"

/**
 * Provides simpler and/or combined api for admin panel. It should not be used outside of it for now.
 * API is not stable
 * @internal
 */
@Module({
	controllers: [
		AdminPanelInfoController,
		AdminPanelInfraController, //
	],
})
export class AdminPanelInfoModule {}
