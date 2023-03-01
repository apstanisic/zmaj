import { Module } from "@nestjs/common"
import { EmailChangeController } from "./email-change.controller"
import { EmailChangeService } from "./email-change.service"

@Module({
	controllers: [EmailChangeController],
	providers: [EmailChangeService],
})
export class EmailChangeModule {}
