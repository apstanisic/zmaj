import { Global, Module } from "@nestjs/common"
import { DatabaseConfig } from "./database.config"
import { ConfigurableModuleClass } from "./database.module-definition"
import { SequelizeModule } from "./sequelize.module"

/**
 * Database module
 */
@Global()
@Module({
	imports: [SequelizeModule],
	providers: [DatabaseConfig],
	exports: [DatabaseConfig],
})
export class DatabaseModule extends ConfigurableModuleClass {}
