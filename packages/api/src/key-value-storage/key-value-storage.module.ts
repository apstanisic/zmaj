import { Global, Module } from "@nestjs/common"
import { KeyValueStorageService } from "./key-value-storage.service"

@Global()
@Module({
	providers: [KeyValueStorageService],
	exports: [KeyValueStorageService],
})
export class KeyValueStorageModule {}
