import { CollectionMetadataModel, endpoints } from "@zmaj-js/common"
import { BaseModel } from "@zmaj-js/orm"
import { AxiosInstance } from "axios"
import { CrudClient } from "./crud.client"

class CollectionDefModel extends BaseModel {
	override name = "collection_def"
	fields = this.buildFields((f) => ({
		...new CollectionMetadataModel().fields,
		pkColumn: f.text({}),
		pkType: f.enumString({ enum: ["auto-increment", "uuid"] }),
	}))
}

export class CollectionsClient extends CrudClient<CollectionDefModel> {
	constructor(http: AxiosInstance) {
		super(http, endpoints.infraCollections.$base)
	}
}
