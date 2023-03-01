import { Global, Module } from "@nestjs/common"
import { DatabaseConfig } from "./database.config"
import { ConfigurableModuleClass } from "./database.module-definition"

/**
 * Database module
 */
@Global()
@Module({
	imports: [],
	providers: [DatabaseConfig],
	exports: [DatabaseConfig],
})
export class DatabaseModule extends ConfigurableModuleClass {}
