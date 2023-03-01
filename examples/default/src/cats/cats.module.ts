import { Module, OnModuleInit } from "@nestjs/common"
import { CatsController } from "./cats.controller"
import { CatsService } from "./cats.service"

@Module({
	providers: [CatsService],
	controllers: [CatsController],
})
export class CatsModule implements OnModuleInit {
	onModuleInit(): void {
		console.log("Cats module inited")
	}
}
