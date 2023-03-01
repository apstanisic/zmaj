import { endpoints, Role, RoleCreateDto, RoleUpdateDto } from "@zmaj-js/common"
import { AxiosInstance } from "axios"
import { CrudClient } from "./crud.client"

export class RolesClient extends CrudClient<Role, RoleCreateDto, RoleUpdateDto> {
	constructor(http: AxiosInstance) {
		super(http, endpoints.roles.$base)
	}
}
