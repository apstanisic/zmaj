import { endpoints, RoleModel } from "@zmaj-js/common"
import { AxiosInstance } from "axios"
import { CrudClient } from "./crud.client"

export class RolesClient extends CrudClient<RoleModel> {
	constructor(http: AxiosInstance) {
		super(http, endpoints.roles.$base)
	}
}
