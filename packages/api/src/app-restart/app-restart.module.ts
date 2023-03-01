import { Global, Module } from "@nestjs/common"
import { AppRestartService } from "./app-restart.service"

/**
 * App Restart Module
 * @deprecated I do not know if I need this.
 * I used to use it for restarting TypeOrm entities, but I no longer use TypeOrm
 */
@Global()
@Module({
	providers: [AppRestartService],
	exports: [AppRestartService],
})
export class AppRestartModule {}
