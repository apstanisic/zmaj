import { CollectionMetadataModel, endpoints } from "@zmaj-js/common"
import { AxiosInstance } from "axios"
import { CrudClient } from "./crud.client"

export class CollectionsClient extends CrudClient<CollectionMetadataModel> {
	constructor(http: AxiosInstance) {
		super(http, endpoints.infraCollections.$base)
	}
}
