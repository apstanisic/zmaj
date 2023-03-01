import { EventEmitter } from "eventemitter3"
import { SdkState } from "./sdk-state"
import { MemoryStorage } from "./storage/memory.storage"

export const SdkStateStub = (): SdkState => {
	return new SdkState({ emitter: new EventEmitter(), storage: new MemoryStorage() })
}
