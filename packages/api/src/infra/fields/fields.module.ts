import { Global, Module } from "@nestjs/common"
import { FieldsController } from "./fields.controller"
import { FieldsService } from "./fields.service"

@Global()
@Module({
	controllers: [FieldsController],
	providers: [FieldsService],
	exports: [FieldsService],
})
export class FieldsModule {}
