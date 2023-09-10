import { endpoints, PermissionModel } from "@zmaj-js/common"
import { AxiosInstance } from "axios"
import { CrudClient } from "./crud.client"

export class PermissionsClient extends CrudClient<PermissionModel> {
	constructor(http: AxiosInstance) {
		super(http, endpoints.permissions.$base)
	}
}
