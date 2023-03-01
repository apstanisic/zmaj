import { Global, Module } from "@nestjs/common"
import { TranslationsController } from "./translations.controller"
import { TranslationsService } from "./translations.service"

@Global()
@Module({
	providers: [TranslationsService],
	exports: [TranslationsService],
	controllers: [TranslationsController],
})
export class TranslationsModule {}
