import { predefinedApiConfigs } from "./predefined-configs-const"
import { runApi } from "./run-app"

// Don't collapse deep object in terminal
// https://dev.to/ehlo_250/the-trick-to-making-consolelog-play-nice-with-complex-objects-gma
import { Controller, Get, Module } from "@nestjs/common"
import { inspect } from "node:util"
import { BuildTestDbService } from "./testing/build-test-db.service"
import { TestingUtilsModule } from "./testing/testing-utils.module"
inspect.defaultOptions.depth = 4

@Controller()
class Playground {
	constructor(private service: BuildTestDbService) {
		//
	}

	@Get("dev")
	async playground(): Promise<any> {
		return true
	}
}

@Module({ controllers: [Playground] })
class DevModule {}

/**
 *
 *
 *
 *
 */

runApi(predefinedApiConfigs.dev, {
	config: { envPath: "../../.env.dev" }, //
	customModules: [DevModule, TestingUtilsModule],
}).then((_server) => console.log("main.ts: Started"))
