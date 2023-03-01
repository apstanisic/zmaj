import { Module } from "@nestjs/common"
import { RolesController } from "./roles.controller"

@Module({
	providers: [],
	exports: [],
	controllers: [RolesController],
})
export class RolesModule {}
