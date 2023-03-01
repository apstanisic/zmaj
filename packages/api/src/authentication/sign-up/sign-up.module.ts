import { Global, Module } from "@nestjs/common"
import { SignUpController } from "./sign-up.controller"
import { SignUpService } from "./sign-up.service"

@Global()
@Module({
	controllers: [SignUpController],
	providers: [SignUpService],
	exports: [SignUpService],
})
export class SignUpModule {}
