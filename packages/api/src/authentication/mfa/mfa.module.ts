import { Module } from "@nestjs/common"
import { MfaController } from "./mfa.controller"
import { MfaService } from "./mfa.service"
import { UsersMfaService } from "./users-mfa.service"

@Module({
	controllers: [MfaController],
	providers: [MfaService, UsersMfaService],
	exports: [MfaService],
})
export class MfaModule {}
