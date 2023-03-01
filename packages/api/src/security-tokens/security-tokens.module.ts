import { Global, Module } from "@nestjs/common"
import { SecurityTokensService } from "./security-tokens.service"

@Global()
@Module({
	providers: [SecurityTokensService],
	exports: [SecurityTokensService],
})
export class SecurityTokensModule {}
