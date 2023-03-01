import type { CrudAfterEvent } from "@api/crud/crud-event.types"
import { OnCrudEvent } from "@api/crud/on-crud-event.decorator"
import { Injectable } from "@nestjs/common"
import { InfraStateService } from "./infra-state.service"

@Injectable()
export class InfraStateListener {
	constructor(private readonly state: InfraStateService) {}

	private readonly systemCollections = [
		"zmaj_collection_metadata",
		"zmaj_field_metadata",
		"zmaj_relation_metadata",
	]

	// @OnEvent("zmaj.collections.*.*.finish")
	@OnCrudEvent({ type: "after" })
	async onChange(event: CrudAfterEvent): Promise<void> {
		if (event.action === "read") return

		const relevant = this.systemCollections.includes(event.collection.tableName)
		if (!relevant) return

		await this.state.initializeState()
	}
}
