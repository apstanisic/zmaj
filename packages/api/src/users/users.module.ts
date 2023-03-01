import { Global, Module } from "@nestjs/common"
import { UsersController } from "./users.controller"
import { UsersListener } from "./users.listener"
import { UsersService } from "./users.service"

@Global()
@Module({
	controllers: [UsersController],
	providers: [UsersService, UsersListener],
	exports: [UsersService],
})
export class UsersModule {}
