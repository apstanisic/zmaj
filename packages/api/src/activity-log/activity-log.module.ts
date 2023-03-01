import { Global, Module } from "@nestjs/common"
import { ActivityLogConfig } from "./activity-log.config"
import { ActivityLogController } from "./activity-log.controller"
import { ConfigurableModuleClass } from "./activity-log.module-definition"
import { ActivityLogService } from "./activity-log.service"

@Global()
@Module({
	providers: [ActivityLogService, ActivityLogConfig],
	exports: [ActivityLogService],
	controllers: [ActivityLogController],
})
export class ActivityLogModule extends ConfigurableModuleClass {}
