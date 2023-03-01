import { Global, Module } from "@nestjs/common"
import { BuildTestDbService } from "./build-test-db.service"
import { TestingUtilsService } from "./test-utils.service"

@Global()
@Module({
    providers: [TestingUtilsService, BuildTestDbService],
    exports: [TestingUtilsService, BuildTestDbService],
})
export class TestingUtilsModule {}
