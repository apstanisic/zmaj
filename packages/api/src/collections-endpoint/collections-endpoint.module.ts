import { Global, Module } from "@nestjs/common"
import { CollectionsEndpointController } from "./collections-endpoint.controller"

@Global()
@Module({
	controllers: [CollectionsEndpointController],
})
export class CollectionsEndpointModule {}
