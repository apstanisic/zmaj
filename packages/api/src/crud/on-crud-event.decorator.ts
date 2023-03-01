import { OnEvent } from "@nestjs/event-emitter"
import { getCrudEmitKey, GetEmitKeyParams } from "./get-crud-emit-key"

export function OnCrudEvent(params: Partial<GetEmitKeyParams>): MethodDecorator {
	const key = getCrudEmitKey({
		type: params.type ?? "*",
		action: params.action ?? "*",
		collection: params.collection ?? "*",
	})

	return OnEvent(key)
}
