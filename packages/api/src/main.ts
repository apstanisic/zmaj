import { predefinedApiConfigs } from "./predefined-configs-const"
import { runApi } from "./run-app"

// Don't collapse deep object in terminal
// https://dev.to/ehlo_250/the-trick-to-making-consolelog-play-nice-with-complex-objects-gma
import { Controller, Get, Module } from "@nestjs/common"
import { inspect } from "node:util"
import { InfraStateService } from "./infra/infra-state/infra-state.service"
inspect.defaultOptions.depth = 4

@Controller()
class Playground {
	constructor(private state: InfraStateService) {
		//
	}

	@Get("dev")
	async playground(): Promise<any> {
		return true
	}
}

@Module({	controllers:  [Playground]})
class DevModule {}

/**
 *
 *
 *
 *
 */

runApi(predefinedApiConfigs.dev, {
	config: { envPath: "../../.env.dev" }, //
	customModules: [DevModule],
	database: { logging: true },
}).then((_server) => console.log("main.ts: Started"))
