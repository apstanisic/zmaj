import { Global, Module } from "@nestjs/common"
import { EmailCallbackService } from "./email-callback.service"
import { EmailConfig } from "./email.config"
import { ConfigurableModuleClass } from "./email.module-definition"
import { EmailService } from "./email.service"

@Global()
@Module({
	providers: [EmailService, EmailConfig, EmailCallbackService],
	exports: [EmailService, EmailConfig, EmailCallbackService],
})
export class EmailModule extends ConfigurableModuleClass {}
