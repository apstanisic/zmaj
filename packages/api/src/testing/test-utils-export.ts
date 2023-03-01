import { BuildTestDbService } from "./build-test-db.service"
import { TestingUtilsService } from "./test-utils.service"
import { TestingUtilsModule } from "./testing-utils.module"

export const __testUtils = {
	TestingUtilsService,
	TestingUtilsModule,
	BuildTestDbService,
}
