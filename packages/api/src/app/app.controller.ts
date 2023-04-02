import { Controller, Get } from "@nestjs/common"
import { GlobalConfig } from "./global-app.config"

@Controller("")
export class AppController {
	constructor(private config: GlobalConfig) {}
	@Get("/")
	async home(): Promise<any> {
		return { message: "API successfully reached." }
	}

	@Get('/app-info')
	async appInfo(): Promise<{ name: string }> {
		return {
			name: this.config.name,
		}
	}
}
