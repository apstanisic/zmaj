import { Global, Module } from "@nestjs/common"
import { CollectionsController } from "./collections.controller"
import { CollectionsService } from "./collections.service"

@Global()
@Module({
	providers: [CollectionsService],
	exports: [],
	controllers: [CollectionsController],
})
export class CollectionsModule {}
