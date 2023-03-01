import {
	endpoints,
	CollectionMetadata,
	CollectionCreateDto,
	CollectionUpdateDto,
} from "@zmaj-js/common"
import { AxiosInstance } from "axios"
import { CrudClient } from "./crud.client"

export class CollectionsClient extends CrudClient<
	CollectionMetadata,
	CollectionCreateDto,
	CollectionUpdateDto
> {
	constructor(http: AxiosInstance) {
		super(http, endpoints.infraCollections.$base)
	}
}
