import { Controller, Get } from "@nestjs/common"

@Controller("")
export class AppController {
	@Get("/")
	async home(): Promise<any> {
		return { message: "API successfully reached." }
	}
}
