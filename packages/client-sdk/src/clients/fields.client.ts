import { endpoints, FieldDef, FieldCreateDto, FieldUpdateDto } from "@zmaj-js/common"
import { AxiosInstance } from "axios"
import { CrudClient } from "./crud.client"

export class FieldsClient extends CrudClient<FieldDef, FieldCreateDto, FieldUpdateDto> {
	constructor(http: AxiosInstance) {
		super(http, endpoints.infraFields.$base)
	}
}
