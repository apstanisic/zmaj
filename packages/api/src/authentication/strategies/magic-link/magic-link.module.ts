import { Module } from "@nestjs/common"
import { MagicLinkController } from "./magic-link.controller"
import { MagicLinkService } from "./magic-link.service"
import { MagicLinkStrategy } from "./magic-link.strategy"

@Module({
	controllers: [MagicLinkController],
	providers: [MagicLinkStrategy, MagicLinkService],
	exports: [MagicLinkStrategy, MagicLinkService],
})
export class MagicLinkModule {}
