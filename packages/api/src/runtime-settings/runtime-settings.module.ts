import { Global, Module } from "@nestjs/common"
import { DynamicSettingsController } from "./runtime-settings.controller"
import { RuntimeSettingsService } from "./runtime-settings.service"

@Global()
@Module({
	controllers: [DynamicSettingsController],
	providers: [RuntimeSettingsService],
	exports: [RuntimeSettingsService],
})
export class RuntimeSettingsModule {}
