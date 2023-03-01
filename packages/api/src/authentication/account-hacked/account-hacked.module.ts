import { Module } from "@nestjs/common"
import { AccountHackedService } from "./account-hacked.service"

@Module({
	providers: [AccountHackedService],
})
export class AccountHackedModule {}
