import { sdkThrow } from "@client-sdk/errors/error-utils"
import { Data, CollectionDef } from "@zmaj-js/common"
import { AxiosInstance } from "axios"
import { FieldsClient } from "./fields.client"
import { CollectionsClient } from "./collections.client"
import { RelationsClient } from "./relations.client"

export class InfraClient {
	readonly fields: FieldsClient
	readonly relations: RelationsClient
	readonly collections: CollectionsClient

	constructor(private readonly client: AxiosInstance) {
		this.fields = new FieldsClient(this.client)
		this.relations = new RelationsClient(this.client)
		this.collections = new CollectionsClient(this.client)
	}

	/** Get all infra collections */
	async getCollections(): Promise<CollectionDef[]> {
		return this.client
			.get<Data<CollectionDef[]>>("system/infra/collections")
			.then((r) => r.data.data)
			.catch(sdkThrow)
	}

	/** Get all infra collections for GUI. This will return only fields that user can see  */
	async getAdminPanelInfra(): Promise<CollectionDef[]> {
		return this.client
			.get<Data<CollectionDef[]>>("admin-panel-wip/infra")
			.then((r) => r.data.data)
			.catch(sdkThrow)
	}
}
