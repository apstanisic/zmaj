import { Global, Module } from "@nestjs/common"
import { PasswordResetController } from "./password-reset.controller"
import { PasswordResetService } from "./password-reset.service"

@Global()
@Module({
	imports: [],
	providers: [PasswordResetService],
	exports: [PasswordResetService],
	controllers: [PasswordResetController],
})
export class PasswordResetModule {}
