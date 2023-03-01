import { Global, Module } from "@nestjs/common"
import { APP_FILTER } from "@nestjs/core"
import { StorageExceptionFilter } from "./storage-exception.filter"
import { StorageConfig } from "./storage.config"
import { ConfigurableModuleClass } from "./storage.module-definition"
import { StorageService } from "./storage.service"

@Global()
@Module({
	providers: [
		StorageService,
		StorageConfig,
		{
			provide: APP_FILTER,
			useClass: StorageExceptionFilter,
		},
	],
	exports: [StorageService, StorageConfig],
})
export class StorageModule extends ConfigurableModuleClass {}
