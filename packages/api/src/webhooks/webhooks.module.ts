import { Global, Module } from "@nestjs/common"
import { WebhooksController } from "./webhooks.controller"
import { WebhooksService } from "./webhooks.service"

/**
 * Module for managing and calling webhooks
 */
@Global()
@Module({
	providers: [WebhooksService],
	exports: [],
	controllers: [WebhooksController],
})
export class WebhooksModule {}
