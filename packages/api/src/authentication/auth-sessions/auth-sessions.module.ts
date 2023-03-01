import { Global, Module } from "@nestjs/common"
import { AuthSessionsApiService } from "./auth-sessions.api.service"
import { AuthSessionsController } from "./auth-sessions.controller"
import { AuthSessionsService } from "./auth-sessions.service"
import { UserAgentService } from "./user-agent.service"

@Global()
@Module({
	controllers: [AuthSessionsController],
	providers: [AuthSessionsService, AuthSessionsApiService, UserAgentService],
	exports: [AuthSessionsService, UserAgentService],
})
export class AuthSessionsModule {}
