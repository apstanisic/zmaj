import { Global, Module } from "@nestjs/common"
import { InitializeAdminController } from "./initialize-admin.controller"
import { InitializeAdminService } from "./initialize-admin.service"

@Global()
@Module({
	controllers: [InitializeAdminController],
	providers: [InitializeAdminService],
	exports: [InitializeAdminService],
})
export class InitializeAdminModule {}
