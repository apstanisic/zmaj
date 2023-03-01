import { Global, Module } from "@nestjs/common"
import { EmailConfig } from "./email.config"
import { ConfigurableModuleClass } from "./email.module-definition"
import { EmailService } from "./email.service"

@Global()
@Module({
	providers: [EmailService, EmailConfig],
	exports: [EmailService, EmailConfig],
})
export class EmailModule extends ConfigurableModuleClass {}
